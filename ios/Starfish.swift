import DittoSwift

struct LiveQueryAndSubscription {
    var liveQuery: DittoLiveQuery
    var subscription: DittoSubscription?
}


@objc(Starfish)
class Starfish: NSObject {
    
    var dittoMap: [String: DittoSwift.Ditto] = [:]
    var liveQueryAndSubscriptionsMap: [String: LiveQueryAndSubscription] = [:]
    var subscriptionsMap: [String: DittoSubscription] = [:]
    var presenceObserverMap: [String: DittoObserver] = [:]
    
    @objc(createDitto:withOnlinePlaygroundToken:)
    func createDitto(appId: String, token: String) {
        if (dittoMap[appId] != nil) { return }
        let ditto = Ditto(identity: .onlinePlayground(appID: appId, token: token))
        try! ditto.startSync()
        dittoMap[appId] = ditto
    }
    
    @objc(stopDitto:)
    func stopDitto(appId: String) {
        guard let ditto = dittoMap[appId] else { return }
        ditto.stopSync()
    }
    
    @objc(startDitto:)
    func startDitto(appId: String) {
        guard let ditto = dittoMap[appId] else { return }
        try! ditto.startSync()
    }
    
    @objc(liveQuery:queryParams:localOnly:callback:)
    func liveQuery(appId: String, queryParams: NSDictionary, localOnly: Bool, callback: @escaping RCTResponseSenderBlock) {
        guard let cursor = convertQueryParamsToPendingCursor(appId: appId, queryParams: queryParams) else {
            return
        }
        let uuid = UUID().uuidString
        let lq = cursor.observeLocal { docs, _ in
            let arrayOfDocuments = cursor.exec().map({ $0.value })
            let nsArray = NSArray(array: arrayOfDocuments)
            callback([nsArray, uuid])
        }
        
        var sub: DittoSubscription? = nil
        if (!localOnly) {
            sub = cursor.subscribe()
        }
        let lqAndSub = LiveQueryAndSubscription(liveQuery: lq, subscription: sub)
        liveQueryAndSubscriptionsMap[uuid] = lqAndSub
    }
    
    @objc(stopLiveQuery:)
    func stopLiveQuery(liveQueryId: String) {
        liveQueryAndSubscriptionsMap[liveQueryId]?.liveQuery.stop()
        liveQueryAndSubscriptionsMap[liveQueryId]?.subscription?.cancel()
        liveQueryAndSubscriptionsMap.removeValue(forKey: liveQueryId)
    }
    
    @objc(upsert:collection:document:resolver:rejecter:)
    func upsert(appId: String, collection: String, document: NSDictionary, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        guard let ditto = dittoMap[appId] else {
            rejecter("upsert error", "Failed to find a ditto instance with appId \(appId)", nil)
            return
        }
        do {
            let mutableDictionary = NSMutableDictionary(dictionary: document)
            var newDocumentPayload: [String: Any?] = [:]
            for (key, value) in mutableDictionary {
                if let key = key as? String, value is NSDictionary {
                    newDocumentPayload[key] = DittoRegister(value: value)
                }
            }
            let upsertedDocumentId = try ditto.store[collection].upsert(document as? [String: Any?] ?? [:])
            resolver([upsertedDocumentId.value])
        } catch(let e) {
            rejecter("upsert error", e.localizedDescription, nil)
        }
    }
    
    @objc(find:queryParams:resolver:rejecter:)
    func find(appId: String, queryParams: NSDictionary, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        guard let cursor = convertQueryParamsToPendingCursor(appId: appId, queryParams: queryParams) else {
            rejecter("find error", "there is no app with appId \(appId)", nil)
            return
        }
        let arrayOfDocuments = cursor.exec().map({ $0.value })
        resolver([NSArray(array: arrayOfDocuments)])
    }
    
    @objc(evict:queryParams:)
    func evict(appId: String, queryParams: NSDictionary) {
        guard let cursor = convertQueryParamsToPendingCursor(appId: appId, queryParams: queryParams) else { return }
        cursor.evict()
    }
    
    @objc(remove:queryParams:)
    func remove(appId: String, queryParams: NSDictionary) {
        guard let cursor = convertQueryParamsToPendingCursor(appId: appId, queryParams: queryParams) else { return }
        cursor.remove()
    }
    
    @objc(observePresence:callback:)
    func observePresence(appId: String, callback: @escaping RCTResponseSenderBlock) -> String? {
        guard let ditto = dittoMap[appId] else  { return nil }
        let observer = ditto.presence.observe { graph in
            guard let data = try? JSONEncoder().encode(graph) else { return }
            guard let jsonString = String(data: data, encoding: .utf8) else { return }
            callback([jsonString])
        }
        let uuid = UUID().uuidString
        presenceObserverMap[uuid] = observer
        return uuid
    }
    @objc(stopObservingPresence:)
    func stopObservingPresence(presenceObserverId: String) {
        presenceObserverMap[presenceObserverId]?.stop()
        presenceObserverMap.removeValue(forKey: presenceObserverId)
    }
    
    private func convertQueryParamsToPendingCursor(appId: String, queryParams: NSDictionary?) -> DittoPendingCursorOperation? {
        let collection = queryParams?.value(forKey: "collection") as? String
        let find = queryParams?.value(forKey: "find") as? String
        let args = queryParams?.value(forKey: "args") as? [String: Any]
        let limit = queryParams?.value(forKey: "limit") as? Int32
        let sort = queryParams?.value(forKey: "sort") as? [String: Any]
        
        guard let ditto = dittoMap[appId], let collection = collection else {
            return nil
        }
        var cursorOperation: DittoPendingCursorOperation = ditto.store.collection(collection).findAll()
        if let find = find {
            cursorOperation = ditto.store.collection(collection).find(find, args: args ?? [:])
        }
        if let limit = limit {
            cursorOperation = cursorOperation.limit(limit)
        }
        if let sort = sort, let path = sort["path"] as? String {
            let isAscending = sort["isAscending"] as? Bool ?? false
            cursorOperation = cursorOperation.sort(path, direction: isAscending ? .ascending : .descending)
        }
        return cursorOperation
    }
    
    deinit {
        print("Starfish Module Deinit")
    }
}

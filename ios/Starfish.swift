import DittoSwift

struct LiveQueryAndSubscription {
    var liveQuery: DittoLiveQuery
    var subscription: DittoSubscription?
}


@objc(Starfish)
class Starfish: RCTEventEmitter {
    
    var dittoMap: [String: DittoSwift.Ditto] = [:]
    var liveQueryAndSubscriptionsMap: [String: LiveQueryAndSubscription] = [:]
    var subscriptionsMap: [String: DittoSubscription] = [:]
    var presenceObserverMap: [String: DittoObserver] = [:]
    
    override func supportedEvents() -> [String]! {
        return [
            "onLiveQueryUpdate",
            "onPresenceUpdate"
        ]
    }
    
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
    
    
    @objc(registerLiveQuery:queryParams:localOnly:liveQueryId:)
    func registerLiveQuery(appId: String, queryParams: NSDictionary, localOnly: Bool, liveQueryId: String) {
        guard let cursor = convertQueryParamsToPendingCursor(appId: appId, queryParams: queryParams) else {
            return
        }
        let lq = cursor.observeLocal { [weak self] docs, _ in
            let arrayOfDocuments = cursor.exec().map({ $0.value })
            let nsArray = NSArray(array: arrayOfDocuments)
            self?.sendEvent(withName: "onLiveQueryUpdate", body: NSDictionary(dictionary: [
                "liveQueryId": liveQueryId,
                "documents": nsArray
            ]))
        }
        
        var sub: DittoSubscription? = nil
        if (!localOnly) {
            sub = cursor.subscribe()
        }
        let lqAndSub = LiveQueryAndSubscription(liveQuery: lq, subscription: sub)
        liveQueryAndSubscriptionsMap[liveQueryId] = lqAndSub
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
    
    @objc(evict:queryParams:resolver:rejecter:)
    func evict(appId: String, queryParams: NSDictionary, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        guard let cursor = convertQueryParamsToPendingCursor(appId: appId, queryParams: queryParams) else {
            rejecter("evict error", "Failed to find a ditto instance with appId \(appId)", nil)
            return
        }
        let docIds = cursor.evict().compactMap({ $0.value })
        resolver([NSArray(array: docIds)])
    }
    
    @objc(remove:queryParams:resolver:rejecter:)
    func remove(appId: String, queryParams: NSDictionary, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        guard let cursor = convertQueryParamsToPendingCursor(appId: appId, queryParams: queryParams) else {
            rejecter("remove error", "Failed to find a ditto instance with appId \(appId)", nil)
            return
        }
        let docIds = cursor.remove().compactMap({ $0.value })
        resolver([NSArray(array: docIds)])
    }
    
    @objc(registerPresenceObserver:callback:)
    func registerPresenceObserver(appId: String, presenceObserverId: String) {
        guard let ditto = dittoMap[appId] else  { return }
        let observer = ditto.presence.observe { graph in
            guard let data = try? JSONEncoder().encode(graph) else { return }
            guard let jsonString = String(data: data, encoding: .utf8) else { return }
            self.sendEvent(withName: "onPresenceUpdate", body: [
                "presenceObserverId": presenceObserverId,
                "graph": jsonString
            ])
        }
        presenceObserverMap[presenceObserverId] = observer
    }
    
    @objc(stopPresenceObserver:)
    func stopPresenceObserver(presenceObserverId: String) {
        presenceObserverMap[presenceObserverId]?.stop()
        presenceObserverMap.removeValue(forKey: presenceObserverId)
    }
    
    @objc(getDittoInformation:resolver:rejecter:)
    func getDittoInformation(appId: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        guard let ditto = dittoMap[appId] else {
            rejecter("getDittoInformation error", "Failed to find a ditto instance with appId \(appId)", nil)
            return
        }
        let response = [
            "sdkVersion": ditto.sdkVersion
        ]
        resolver(NSDictionary(dictionary: response))
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

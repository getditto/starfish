package com.starfish

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import live.ditto.Ditto
import live.ditto.DittoIdentity
import live.ditto.DittoLiveQuery
import live.ditto.DittoPendingCursorOperation
import live.ditto.DittoPresenceObserver
import live.ditto.DittoRegister
import live.ditto.DittoSortDirection
import live.ditto.DittoSubscription
import live.ditto.android.DefaultAndroidDittoDependencies
import java.util.concurrent.Flow.Subscription

class LiveQueryAndSubscription(val liveQuery: DittoLiveQuery, val subscription: DittoSubscription?)

class StarfishModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  var dittoMap = mutableMapOf<String, Ditto>()
  var subscriptionsMap = mutableMapOf<String, Subscription>()
  var liveQueryAndSubscriptionsMap = mutableMapOf<String, LiveQueryAndSubscription>()
  var presenceObserversMap = mutableMapOf<String, DittoPresenceObserver>()

  @ReactMethod
  fun createDitto(appId: String, token: String) {

    if (dittoMap.containsKey(appId)) {
      return
    }

    val androidDependencies = DefaultAndroidDittoDependencies(reactApplicationContext)
    val identity = DittoIdentity.OnlinePlayground(
      androidDependencies,
      appId = appId,
      token = token
    )
    val ditto = Ditto(androidDependencies, identity)
    try {
        ditto.startSync()
    } catch (e: Exception) {
      println(e)
    }
    dittoMap[appId] = ditto
  }

  @ReactMethod
  fun startDitto(appId: String) {
    val ditto = dittoMap[appId]
    ditto?.startSync()
  }

  @ReactMethod
  fun stopDitto(appId: String) {
    val ditto = dittoMap[appId]
    ditto?.stopSync()
  }

  @ReactMethod
  fun stopLiveQuery(liveQueryId: String) {
    val liveQueryAndSubscription = liveQueryAndSubscriptionsMap[liveQueryId]
    liveQueryAndSubscription?.subscription?.close()
    liveQueryAndSubscriptionsMap.remove(liveQueryId)
  }

  @ReactMethod
  fun upsert(appId: String, collection: String, document: ReadableMap, promise: Promise) {
    val ditto = dittoMap[appId]
    if (ditto == null) {
      promise.reject("upsert error", "failed to upsert document")
      return
    }
    val map = document.toHashMap()
    /**
     * Recursively convert nested maps to DittoRegister
     * This is needed because this project does not allow for update apis
     */
    map.entries.forEach {
      if (it.value is Map<*, *> && it.key != "_id") {
        map[it.key] = DittoRegister(it.value)
      }
    }
    val upsertedId = ditto.store.collection(collection).upsert(map)
    promise.resolve(upsertedId.value)
  }

  @ReactMethod
  fun remove(appId: String, queryParams: ReadableMap, promise: Promise) {
    val cursorOperation = convertQueryParamsToPendingCursor(appId, queryParams)
    if (cursorOperation == null) {
      promise.reject("remove error", "failed to remove document")
      return
    }
    val removedDocumentIds = cursorOperation.remove()
    promise.resolve(toWritableArray(removedDocumentIds.map { it.value }))
  }

  @ReactMethod
  fun evict(appId: String, queryParams: ReadableMap, promise: Promise) {
    val cursorOperation = convertQueryParamsToPendingCursor(appId, queryParams)
    if (cursorOperation == null) {
      promise.reject("evict error", "failed to remove document")
      return
    }
    val evictedDocumentId = cursorOperation.evict()
    promise.resolve(toWritableArray(evictedDocumentId.map { it.value }))
  }

  @ReactMethod
  fun registerLiveQuery(appId: String, queryParams: ReadableMap, localOnly: Boolean, liveQueryId: String) {
    val cursorOperation = convertQueryParamsToPendingCursor(appId, queryParams) ?: return

    val lq = cursorOperation.observeLocal { docs, e ->
      val eventParams = Arguments.createMap().apply {
        putString("liveQueryId", liveQueryId)
        putArray("documents", toWritableArray(docs.map { it.value }))
      }
      sendEvent(this.reactApplicationContext, "onLiveQueryUpdate", eventParams)
    }
    var sub: DittoSubscription? = null
    if (!localOnly) {
      sub = cursorOperation.subscribe()
    }
    liveQueryAndSubscriptionsMap[liveQueryId] = LiveQueryAndSubscription(lq, sub)
  }

  @ReactMethod
  fun registerPresenceObserver(appId: String, presenceObserverId: String) {
    val ditto = dittoMap[appId] ?: return
    val o = ditto.presence.observe { graph ->
      val eventParams = Arguments.createMap().apply {
        putString("presenceObserverId", presenceObserverId)
        putString("graph", graph.json())
      }
      sendEvent(this.reactApplicationContext, "onPresenceUpdate", eventParams)
    }
    presenceObserversMap[presenceObserverId] = o
  }

  @ReactMethod
  fun stopPresenceObserver(presenceObserverId: String) {
    val o = presenceObserversMap[presenceObserverId] ?: return
    o.close()
    presenceObserversMap.remove(presenceObserverId)
  }


  companion object {
    const val NAME = "Starfish"
  }

  /**
   * This method allows Android to send events to JavaScript.
   */
  private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  /**
   * Do not remove this,
   * It's necessary for compilation even though it's empty
   */
  @ReactMethod
  fun addListener(type: String?) {
    // Keep: Required for RN built in Event Emitter Calls.
  }
  /**
   * Do not remove this,
   * It's necessary for compilation even though it's empty
   */
  @ReactMethod
  fun removeListeners(type: Int?) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  /**
   * This function will try to create a cursor from the appId and queryParams
   * If the appId is not found, it will return null
   */
  private fun convertQueryParamsToPendingCursor(appId: String, queryParams: ReadableMap): DittoPendingCursorOperation? {
    val collection = queryParams.getString("collection")
    val find = queryParams.getString("find")
    val args = queryParams.getMap("args")
    val limit = queryParams.getNullableInt("limit")
    val sort = queryParams.getMap("sort")

    val ditto = dittoMap[appId]
    if (ditto == null || collection == null) {
      return null
    }
    var cursorOperation: DittoPendingCursorOperation = ditto.store.collection(collection).findAll()
    find?.let {
      cursorOperation = ditto.store.collection(collection).find(it, args?.toHashMap() ?: emptyMap())
    }
    limit?.let {
      cursorOperation = cursorOperation.limit(it)
    }
    sort?.let { it ->
      val path = it.getString("path")
      path?.let { path ->
        val isAscending = sort.getBoolean("isAscending") as Boolean? ?: false
        cursorOperation = cursorOperation.sort(path, if (isAscending) DittoSortDirection.Ascending else DittoSortDirection.Descending)
      }
    }
    return cursorOperation
  }

  @ReactMethod
  fun getDittoInformation(appId: String, promise: Promise) {
    val ditto = dittoMap[appId];
    if (ditto == null) {
      promise.reject("getDittoInformation error", "failed to get ditto information")
      return
    }
    val dittoVersion = ditto.sdkVersion
    val response = Arguments.createMap().apply {
      putString("sdkVersion", dittoVersion)
    }
    promise.resolve(response)
  }
}

/**
 * We added this because ReadableMap.getInt() throws an exception if the key is not present
 * This is not ideal for our use case because we want to be able to pass null values
 */
fun ReadableMap.getNullableInt(key: String): Int? {
  return if (this.hasKey(key) && this.getType(key) == ReadableType.Number) {
    this.getInt(key)
  } else {
    null
  }
}

private fun toWritableMap(map: Map<String, Any?>): WritableMap {
  val writableMap = Arguments.createMap()

  map.forEach { (key, value) ->
    when (value) {
      null -> writableMap.putNull(key)
      is Boolean -> writableMap.putBoolean(key, value)
      is Int -> writableMap.putInt(key, value)
      is Double -> writableMap.putDouble(key, value)
      is String -> writableMap.putString(key, value)
      is Map<*, *> -> writableMap.putMap(key, toWritableMap(value as Map<String, Any?>))
      is List<*> -> writableMap.putArray(key, toWritableArray(value))
      else -> throw IllegalArgumentException("Unsupported type for key: $key")
    }
  }

  return writableMap
}

private fun toWritableArray(list: List<*>): WritableArray {
  val writableArray = Arguments.createArray()

  list.forEach { value ->
    when (value) {
      null -> writableArray.pushNull()
      is Boolean -> writableArray.pushBoolean(value)
      is Int -> writableArray.pushInt(value)
      is Double -> writableArray.pushDouble(value)
      is String -> writableArray.pushString(value)
      is Map<*, *> -> writableArray.pushMap(toWritableMap(value as Map<String, Any?>))
      is List<*> -> writableArray.pushArray(toWritableArray(value))
      else -> throw IllegalArgumentException("Unsupported type")
    }
  }
  return writableArray
}

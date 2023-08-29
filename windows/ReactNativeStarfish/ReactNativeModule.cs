using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.ReactNative;
using Microsoft.ReactNative.Managed;
using DittoSDK;
using System.ComponentModel;
using Windows.Storage;
using Newtonsoft.Json;

namespace ReactNativeStarfish
{
  class LiveQueryAndSubscription
  {
    public DittoLiveQuery liveQuery;
    public DittoSubscription subscription;
    public LiveQueryAndSubscription(DittoLiveQuery liveQuery, DittoSubscription subscription)
    {
      this.liveQuery = liveQuery;
      this.subscription = subscription;
    }
  }

  [ReactModule("ReactNativeStarfish")]
  internal sealed class ReactNativeModule
  {



    // See https://microsoft.github.io/react-native-windows/docs/native-modules for details on writing native modules

    private ReactContext _reactContext;
    private Dictionary<string, Ditto> _dittoMap = new Dictionary<string, Ditto>();
    private Dictionary<string, DittoSubscription> _subscriptionMap = new Dictionary<string, DittoSubscription>();
    private Dictionary<string, LiveQueryAndSubscription> _liveQueryAndSubscriptionsMap = new Dictionary<string, LiveQueryAndSubscription>();
    private Dictionary<string, DittoPresenceObserver> _presenceObserversMap = new Dictionary<string, DittoPresenceObserver>();


    [ReactInitializer]
    public void Initialize(ReactContext reactContext)
    {
      _reactContext = reactContext;
    }

    [ReactMethod]
    public void CreateDitto(string appId, string token)
    {
      var identity = DittoIdentity.OnlinePlayground(appId, token);
      StorageFolder localFolder = ApplicationData.Current.LocalFolder;
      var task = Task.Run<StorageFolder>(async () => await localFolder.CreateFolderAsync("ditto", CreationCollisionOption.OpenIfExists));
      var result = task.Result;
      var ditto = new Ditto(identity, result.Path);
      _dittoMap[appId] = ditto;
    }

    [ReactMethod]
    public void StartDitto(string appId)
    {
      var ditto = _dittoMap[appId];
      if (ditto != null)
      {
        ditto.StartSync();
      }
    }

    [ReactMethod]
    public void StopDitto(string appId)
    {
      var ditto = _dittoMap[appId];
      if (ditto != null) { ditto.StopSync(); }
    }

    [ReactMethod]
    public async Task<object> Upsert(string appId, string collection, Dictionary<string, object> document)
    {
      var ditto = _dittoMap[appId];
      var dictionaryWithRegisters = new Dictionary<string, object>();
      foreach (var item in document)
      {
        dictionaryWithRegisters[item.Key] = new DittoRegister(item.Value);
      }
      var upsertedId = ditto.Store.Collection(collection).Upsert(dictionaryWithRegisters);
      var upsertedIdValue = upsertedId.Value;
      return upsertedIdValue;
    }

    [ReactMethod]
    public async Task<object[]> Remove(string appId, Dictionary<string, object> queryParams)
    {
      var cursorOperation = ConvertQueryParamsToPendingCursor(appId, queryParams);
      if (cursorOperation == null)
      {
        return null;
      }
      var removedDocumentIds = cursorOperation.Remove();
      return removedDocumentIds.Select(x => x.Value).ToArray();
    }

    [ReactMethod]
    public async Task<object[]> Evict(string appId, Dictionary<string, object> queryParams)
    {
      var cursorOperation = ConvertQueryParamsToPendingCursor(appId, queryParams);
      if (cursorOperation == null)
      {
        return null;
      }
      var removedDocumentIds = cursorOperation.Evict();
      return removedDocumentIds.Select(x => x.Value).ToArray();
    }

    [ReactEvent("onLiveQueryUpdate")]
    public Action<string, Dictionary<string, object>[]> OnLiveQueryUpdate { get; set; }

    [ReactMethod]
    public void RegisterLiveQuery(string appId, Dictionary<string, object> queryParams, bool localOnly, string liveQueryId)
    {
      var cursorOperation = ConvertQueryParamsToPendingCursor(appId, queryParams);
      var lq = cursorOperation.ObserveLocal((docs, e) =>
      {
        OnLiveQueryUpdate(liveQueryId, docs.Select(d => d.Value).ToArray());
      });
      DittoSubscription sub = null;
      if (!localOnly)
      {
        sub = cursorOperation.Subscribe();
      }
      _liveQueryAndSubscriptionsMap[liveQueryId] = new LiveQueryAndSubscription(lq, sub);
    }

    [ReactMethod]
    public void StopLiveQuery(string liveQueryId)
    {
      var liveQueryAndSubscription = _liveQueryAndSubscriptionsMap[liveQueryId];
      var sub = liveQueryAndSubscription.subscription;
      var lq = liveQueryAndSubscription.liveQuery;
      if (sub != null)
      {
        sub.Dispose();
      }
      if (lq != null)
      {
        lq.Dispose();
      }
      _liveQueryAndSubscriptionsMap.Remove(liveQueryId);
    }

    [ReactEvent("onPresenceUpdate")]
    public Action<string, string> OnPresenceUpdate { get; set; }

    [ReactMethod]
    public void RegisterPresenceObserver(string appId, string presenceObserverId)
    {
      var ditto = _dittoMap[appId];
      if (ditto == null) { return; }
      var o = ditto.Presence.Observe((graph) =>
      {
        var jsonString = JsonConvert.SerializeObject(graph);
        OnPresenceUpdate(presenceObserverId, jsonString);
      });
      _presenceObserversMap[presenceObserverId] = o;
    }

    [ReactMethod]
    public void StopPresenceObserver(string presenceObserverId)
    {
      var o = _presenceObserversMap[presenceObserverId];
      if (o == null) { return; }
      o.Stop();
      _presenceObserversMap.Remove(presenceObserverId);
    }

    private DittoPendingCursorOperation ConvertQueryParamsToPendingCursor(string appId, Dictionary<string, object> queryParams)
    {
      var ditto = _dittoMap[appId];
      if (ditto == null) { return null; }
      var collection = queryParams["collection"] as string;
      if (collection == null) { return null; }

      var find = queryParams["find"] as string;
      var args = queryParams["args"] as Dictionary<string, object>;
      var limit = queryParams["limit"] as int?;
      var sort = queryParams["sort"] as Dictionary<string, object>; ;

      DittoPendingCursorOperation cursorOperation = null;
      if (find != null)
      {
        cursorOperation = ditto.Store.Collection(collection).Find(find, args ?? new Dictionary<string, object>());
      } else
      {
        cursorOperation = ditto.Store.Collection(collection).FindAll();
      }
      if (limit != null)
      {
        cursorOperation = cursorOperation.Limit(limit.Value);
      }
      if (sort != null)
      {
        string path = sort["path"] as string;
        if (path != null)
        {
          bool isAscending = sort["isAscending"] as bool? ?? false;
          cursorOperation = cursorOperation.Sort(path, isAscending ? DittoSortDirection.Ascending : DittoSortDirection.Descending);
        }
      }
      return cursorOperation;
    }

  }
}

#import <React/RCTBridgeModule.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(Starfish, RCTEventEmitter)

RCT_EXTERN_METHOD(createDitto:(NSString *)appId withOnlinePlaygroundToken:(NSString *)token)
RCT_EXTERN_METHOD(startDitto:(NSString *)appId)
RCT_EXTERN_METHOD(stopDitto:(NSString *)appId)
RCT_EXTERN_METHOD(registerLiveQuery:(NSString*)appId queryParams:(NSDictionary*)queryParams localOnly:(BOOL) localOnly liveQueryId:(NSString *)liveQueryId)
RCT_EXTERN_METHOD(stopLiveQuery:(NSString*)liveQueryId)
RCT_EXTERN_METHOD(subscribe:(NSString*)appId queryParams:(NSDictionary*)queryParams)
RCT_EXTERN_METHOD(unsubscribe:(NSString*)subscriptionId)
RCT_EXTERN_METHOD(find:(NSString*)appId queryParams:(NSDictionary*)queryParams resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(evict:(NSString*)appId queryParams:(NSDictionary*)queryParams)
RCT_EXTERN_METHOD(remove:(NSString*)appId queryParams:(NSDictionary*)queryParams)
RCT_EXTERN_METHOD(upsert:(NSString*)appId collection:(NSString*)collection document:(NSDictionary*)document resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(observePresence:(NSString*)appId callback:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(stopObservingPresence:)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end

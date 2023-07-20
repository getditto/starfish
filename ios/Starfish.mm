#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Starfish, NSObject)

RCT_EXTERN_METHOD(multiply:(float)a withB:(float)b
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(createDitto:(NSString *)appId withOnlinePlaygroundToken:(NSString *)token)
RCT_EXTERN_METHOD(startDitto:(NSString *)appId)
RCT_EXTERN_METHOD(stopDitto:(NSString *)appId)
RCT_EXTERN_METHOD(liveQuery:(NSString*)appId queryParams:(NSDictionary*)queryParams localOnly:(BOOL) localOnly callback:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(stopLiveQuery:(NSString*)liveQueryId)
RCT_EXTERN_METHOD(subscribe:(NSString*)appId queryParams:(NSDictionary*)queryParams)
RCT_EXTERN_METHOD(unsubscribe:(NSString*)subscriptionId)
RCT_EXTERN_METHOD(evict:(NSString*)appId queryParams:(NSDictionary*)queryParams)
RCT_EXTERN_METHOD(remove:(NSString*)appId queryParams:(NSDictionary*)queryParams)
RCT_EXTERN_METHOD(upsert:(NSString*)appId queryParams:(NSDictionary*)queryParams)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end

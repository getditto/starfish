﻿// AutolinkedNativeModules.g.cs contents generated by "react-native autolink-windows"

using System.Collections.Generic;

// Namespaces from react-native-starfish
using ReactNativeStarfish;

// Namespaces from react-native-screens
using RNScreens;

namespace Microsoft.ReactNative.Managed
{
    internal static class AutolinkedNativeModules
    {
        internal static void RegisterAutolinkedNativeModulePackages(IList<IReactPackageProvider> packageProviders)
        { 
            // IReactPackageProviders from react-native-starfish
            packageProviders.Add(new ReactNativeStarfish.ReactPackageProvider());
            // IReactPackageProviders from react-native-screens
            packageProviders.Add(new RNScreens.ReactPackageProvider());
        }
    }
}

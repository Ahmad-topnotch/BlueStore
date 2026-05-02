import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, SafeAreaView, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { generateSafepayUrl } from '../../checkout/payment';

const PaymentScreen = ({ route, navigation }) => {
  // 1. Extract params
  const { totalAmount = 0, orderId = "Order-" + Date.now() } = route.params || {};
  const [isLoading, setIsLoading] = useState(true);

  // 2. Generate the URL
  const checkoutUrl = generateSafepayUrl(totalAmount, orderId);

  // 3. FORCE LOGS - This will run as soon as the component mounts
  useEffect(() => {
    console.log("************************************************");
    console.log("BLUESTORE DEBUG: Safepay URL Generated Below:");
    console.log(checkoutUrl);
    console.log("************************************************");
    
    if (!totalAmount || totalAmount === 0) {
      console.warn("WARNING: totalAmount is 0 or undefined!");
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        {/* Simple Debug Text to confirm the screen is active */}
        <View style={{ padding: 10, backgroundColor: '#f0f0f0' }}>
          <Text style={{ fontSize: 10, color: '#666' }}>Secure Checkout: {orderId}</Text>
        </View>

        <WebView
          key={checkoutUrl}
          source={{ uri: checkoutUrl }}
          style={styles.webview}
          
          // Browser Spoofing & Requirements
          userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36"
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mixedContentMode="always"
          startInLoadingState={true}
          
          onLoadStart={() => {
            console.log("WebView started loading...");
            setIsLoading(true);
          }}
          onLoadEnd={() => {
            console.log("WebView finished loading.");
            setIsLoading(false);
          }}
          
          onNavigationStateChange={(navState) => {
            console.log("Navigating to:", navState.url);
            
            if (navState.url.includes('/mobile')) {
              const urlParts = navState.url.split('?')[1];
              if (urlParts) {
                const params = new URLSearchParams(urlParts);
                const action = params.get('action');

                if (action === 'complete') {
                  Alert.alert("Success", "Payment verified!");
                  navigation.navigate('MainTabs', { screen: 'Orders' });
                } else if (action === 'cancel') {
                  navigation.goBack();
                }
              }
            }
          }}
          onError={(e) => {
            console.error("WEBVIEW ERROR:", e.nativeEvent);
            Alert.alert("Load Error", "The payment gateway failed to load. Check your internet.");
          }}
        />
        
        {isLoading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#1e90ff" />
            <Text style={{ marginTop: 10 }}>Connecting to Safepay...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webview: { flex: 1, opacity: 0.99 },
  loader: { 
    position: 'absolute', 
    top: 0, bottom: 0, left: 0, right: 0, 
    justifyContent: 'center', alignItems: 'center', 
    backgroundColor: '#fff' 
  }
});

export default PaymentScreen;
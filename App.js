import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  BackHandler,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  RefreshControl,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { WebView } from 'react-native-webview';

// Default target URL options
const DEFAULT_CLOUD_URL = 'https://ais-pre-twnzusadlch2hmqriwhiur-383964826128.asia-east1.run.app';
const DEFAULT_LOCAL_PC = 'http://192.168.1.100:3000';
const DEFAULT_EMULATOR = 'http://10.0.2.2:3000';

// Modern mobile Chrome User-Agent to bypass Cloudflare / Google Cloud Run 403 Forbidden
const CHROME_MOBILE_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 TallyMobileBiz';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [httpStatus, setHttpStatus] = useState(null);
  const [currentUrl, setCurrentUrl] = useState(DEFAULT_CLOUD_URL);
  const [customUrlInput, setCustomUrlInput] = useState(DEFAULT_CLOUD_URL);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Handle Android hardware back button
  useEffect(() => {
    if (Platform.OS === 'android') {
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true; // Prevent default app exit
        }
        return false; // Exit app
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }
  }, [canGoBack]);

  const handleReload = () => {
    setHasError(false);
    setHttpStatus(null);
    setIsLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleConnectUrl = (urlToConnect) => {
    const trimmed = (urlToConnect || customUrlInput).trim();
    if (!trimmed) return;
    let validUrl = trimmed;
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'http://' + validUrl;
    }
    setCurrentUrl(validUrl);
    setCustomUrlInput(validUrl);
    setHasError(false);
    setHttpStatus(null);
    setIsLoading(true);
    setShowConfig(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Floating Mini Header with URL Settings Gear */}
      <View style={styles.topControlBar}>
        <View style={styles.topStatusInfo}>
          <View style={styles.liveDot} />
          <Text style={styles.topStatusText} numberOfLines={1}>
            {currentUrl.replace(/^https?:\/\//, '')}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.gearButton}
          onPress={() => setShowConfig(!showConfig)}
          activeOpacity={0.7}
        >
          <Text style={styles.gearButtonText}>⚙ {showConfig ? 'बंद करें' : 'IP बदलें'}</Text>
        </TouchableOpacity>
      </View>

      {/* URL Configuration Dropdown / Modal */}
      {showConfig && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.configCard}
        >
          <Text style={styles.configTitle}>Tally सर्वर कनेक्शन (Server Connection)</Text>
          <Text style={styles.configSubtitle}>
            अपने कंप्यूटर का लोकल IP (जैसे http://192.168.1.x:3000) या क्लाउड URL दर्ज करें:
          </Text>

          <TextInput
            style={styles.urlInput}
            value={customUrlInput}
            onChangeText={setCustomUrlInput}
            placeholder="http://192.168.1.x:3000"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <View style={styles.presetButtonsRow}>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handleConnectUrl(DEFAULT_LOCAL_PC)}
            >
              <Text style={styles.presetChipText}>💻 लोकल WiFi PC (192.168.x)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handleConnectUrl(DEFAULT_EMULATOR)}
            >
              <Text style={styles.presetChipText}>🤖 Android Emulator (10.0.2.2)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handleConnectUrl(DEFAULT_CLOUD_URL)}
            >
              <Text style={styles.presetChipText}>☁️ लाइव क्लाउड सर्वर</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.connectButton}
            onPress={() => handleConnectUrl(customUrlInput)}
          >
            <Text style={styles.connectButtonText}>✓ कनेक्ट करें और लोड करें (Connect Now)</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      )}

      {hasError ? (
        <ScrollView
          contentContainerStyle={styles.errorContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                handleReload();
                setTimeout(() => setRefreshing(false), 1500);
              }}
              colors={['#10b981']}
            />
          }
        >
          <Text style={styles.errorIcon}>{httpStatus === 404 ? '🔍' : httpStatus === 403 ? '🔒' : '📡'}</Text>
          <Text style={styles.errorTitle}>
            {httpStatus === 404
              ? 'पेज नहीं मिला (Page Not Found - 404)'
              : httpStatus === 403
              ? 'सर्वर अनुमति एरर (403 Forbidden)'
              : 'सर्वर से संपर्क नहीं हो पाया'}
          </Text>
          <Text style={styles.errorSubtitle}>
            {httpStatus === 404 || httpStatus === 403
              ? 'चुना गया URL अभी एक्टिव नहीं है या इसे लोकल नेटवर्क पर कंप्यूटर के IP से कनेक्ट करने की आवश्यकता है:'
              : 'कृपया जांचें कि कंप्यूटर और फोन एक ही WiFi या मोबाइल हॉटस्पॉट से जुड़े हैं।'}
          </Text>

          {/* Current URL Card */}
          <View style={styles.urlCard}>
            <Text style={styles.urlLabel}>वर्तमान सर्वर URL (Current URL):</Text>
            <Text style={styles.urlValue} numberOfLines={2}>{currentUrl}</Text>
          </View>

          {/* URL Input on Error Screen */}
          <View style={styles.errorUrlBox}>
            <Text style={styles.errorUrlPrompt}>दुकान PC का लोकल IP दर्ज करें:</Text>
            <TextInput
              style={styles.urlInput}
              value={customUrlInput}
              onChangeText={setCustomUrlInput}
              placeholder="http://192.168.1.x:3000"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handleConnectUrl(customUrlInput)}
            >
              <Text style={styles.buttonText}>✓ इस URL से कनेक्ट करें</Text>
            </TouchableOpacity>
          </View>

          {/* Preset Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => handleConnectUrl(DEFAULT_LOCAL_PC)}
            >
              <Text style={styles.secondaryButtonText}>💻 लोकल PC (WiFi): http://192.168.1.100:3000</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => handleConnectUrl(DEFAULT_EMULATOR)}
            >
              <Text style={styles.secondaryButtonText}>🤖 Android Emulator: http://10.0.2.2:3000</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={handleReload}
            >
              <Text style={styles.outlineButtonText}>पुनः प्रयास करें (Retry Connection)</Text>
            </TouchableOpacity>
          </View>

          {/* WiFi Troubleshooting Tips */}
          <View style={styles.helpBox}>
            <Text style={styles.helpTitle}>💡 कंप्यूटर से कनेक्ट करने की विधि:</Text>
            <Text style={styles.helpText}>1. PC में कमांड प्रॉम्प्ट खोलकर "ipconfig" टाइप करें।</Text>
            <Text style={styles.helpText}>2. "IPv4 Address" देखें (जैसे 192.168.1.15)।</Text>
            <Text style={styles.helpText}>3. ऊपर बॉक्स में http://192.168.1.15:3000 डालकर कनेक्ट करें।</Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.webContainer}>
          <WebView
            ref={webViewRef}
            source={{ uri: currentUrl }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            allowsInlineMediaPlayback={true}
            allowFileAccess={true}
            geolocationEnabled={false}
            mixedContentMode="always"
            userAgent={CHROME_MOBILE_USER_AGENT}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>TallyMobile लोड हो रहा है...</Text>
                <Text style={styles.loadingSubText}>{currentUrl}</Text>
              </View>
            )}
            onNavigationStateChange={(navState) => {
              setCanGoBack(navState.canGoBack);
            }}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              // Ignore subresource failures
              const reqUrl = (nativeEvent.url || '').toLowerCase();
              if (
                reqUrl.endsWith('.ico') ||
                reqUrl.endsWith('.png') ||
                reqUrl.endsWith('.jpg') ||
                reqUrl.includes('/sw.js') ||
                reqUrl.includes('manifest')
              ) {
                return;
              }
              setIsLoading(false);
              setHasError(true);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              const reqUrl = (nativeEvent.url || '').toLowerCase();

              // Ignore all subresources, scripts, styles, APIs, service worker, fonts, manifests
              const isSubResource =
                reqUrl.endsWith('.ico') ||
                reqUrl.endsWith('.png') ||
                reqUrl.endsWith('.jpg') ||
                reqUrl.endsWith('.svg') ||
                reqUrl.endsWith('.json') ||
                reqUrl.endsWith('.js') ||
                reqUrl.endsWith('.css') ||
                reqUrl.includes('/api/') ||
                reqUrl.includes('/sw.js') ||
                reqUrl.includes('favicon') ||
                reqUrl.includes('manifest') ||
                reqUrl.includes('googleapis') ||
                reqUrl.includes('gstatic');

              if (isSubResource) {
                console.log('Ignored subresource HTTP error:', nativeEvent.statusCode, nativeEvent.url);
                return;
              }

              // Only trigger error screen if it is top-level document frame navigation
              const isMainDocument = 
                nativeEvent.isTopFrame === true || 
                reqUrl === currentUrl.toLowerCase() || 
                reqUrl === (currentUrl.toLowerCase() + '/');

              if (isMainDocument && nativeEvent.statusCode >= 400) {
                console.warn('WebView Main Document HTTP error:', nativeEvent.statusCode, nativeEvent.url);
                setHttpStatus(nativeEvent.statusCode);
                setHasError(true);
                setIsLoading(false);
              }
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  topControlBar: {
    height: 38,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  topStatusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  topStatusText: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  gearButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gearButtonText: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: 'bold',
  },
  configCard: {
    backgroundColor: '#1e293b',
    padding: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#10b981',
  },
  configTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  configSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 10,
    lineHeight: 16,
  },
  urlInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#38bdf8',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  presetButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  presetChip: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  presetChipText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '600',
  },
  connectButton: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#f8fafc',
    marginTop: 12,
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingSubText: {
    color: '#64748b',
    marginTop: 4,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  errorContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 44,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
  },
  errorSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  urlCard: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  urlLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  urlValue: {
    fontSize: 12,
    color: '#38bdf8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  errorUrlBox: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#475569',
  },
  errorUrlPrompt: {
    color: '#f1f5f9',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  buttonGroup: {
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#10b981',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#475569',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  helpBox: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  helpTitle: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  helpText: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
  },
});

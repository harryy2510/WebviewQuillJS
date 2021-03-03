import * as React from 'react'
import { WebView } from 'react-native-webview'
import { WebviewQuillJSEvents, WebviewQuillJSMessage, WebViewQuillJSProps } from './models'
import { StyleSheet, View } from 'react-native'
import * as AssetUtils from 'expo-asset-utils'
import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system'

const INDEX_FILE_PATH = require(`./assets/index.html`)

type State = {
    webviewContent: string | null
}

class WebViewQuillJS extends React.Component<WebViewQuillJSProps, State> {
    private webViewRef = React.createRef<WebView>()

    constructor(props: WebViewQuillJSProps) {
        super(props)
        this.state = {
            webviewContent: null
        }
    }

    componentDidMount = () => {
        this.loadHTMLFile()
    }

    componentDidUpdate = (prevProps: WebViewQuillJSProps) => {
        const { initialValue } = this.props
        if (initialValue !== prevProps.initialValue) {
            this.sendMessage({ initialValue })
        }
    }

    render() {
        const {
            handleMessage,
            state: { webviewContent }
        } = this
        return (
            <View
                style={{
                    ...StyleSheet.absoluteFillObject,
                    flex: 1
                }}
            >
                <WebView
                    containerStyle={{
                        flex: 0,
                        height: '100%',
                        width: '100%'
                    }}
                    ref={this.webViewRef}
                    javaScriptEnabled
                    onMessage={(event) => {
                        if (event && event.nativeEvent && event.nativeEvent.data) {
                            handleMessage(event.nativeEvent.data)
                        }
                    }}
                    domStorageEnabled
                    startInLoadingState
                    originWhitelist={['*']}
                    source={{
                        html: webviewContent
                    }}
                    allowFileAccess={true}
                    allowUniversalAccessFromFileURLs={true}
                    allowFileAccessFromFileURLs={true}
                />
            </View>
        )
    }

    private loadHTMLFile = async () => {
        try {
            let asset: Asset = await AssetUtils.resolveAsync(INDEX_FILE_PATH)
            let fileString: string = await FileSystem.readAsStringAsync(asset.localUri)
            this.setState({ webviewContent: fileString })
        } catch (error) {
            console.warn(error)
        }
    }

    private handleMessage = (data: string) => {
        try {
            const message: WebviewQuillJSMessage = JSON.parse(data)
            switch (message.event) {
                case WebviewQuillJSEvents.ON_BLUR:
                    this.props.onBlur?.(
                        message.payload.previousRange,
                        message.payload.source,
                        message.payload.editor
                    )
                    break
                case WebviewQuillJSEvents.ON_CANCEL:
                    this.props.onCancel?.()
                    break
                case WebviewQuillJSEvents.ON_CHANGE:
                    this.props.onChange?.(
                        message.payload.value,
                        message.payload.delta,
                        message.payload.source,
                        message.payload.editor
                    )
                    break
                case WebviewQuillJSEvents.ON_CHANGE_SELECTION:
                    this.props.onChangeSelection?.(
                        message.payload.range,
                        message.payload.source,
                        message.payload.editor
                    )
                    break
                case WebviewQuillJSEvents.ON_FOCUS:
                    this.props.onFocus?.(
                        message.payload.range,
                        message.payload.source,
                        message.payload.editor
                    )
                    break
                case WebviewQuillJSEvents.ON_KEY_DOWN:
                    this.props.onKeyDown(message.payload.event)
                    break
                case WebviewQuillJSEvents.ON_KEY_PRESS:
                    this.props.onKeyPress(message.payload.event)
                    break
                case WebviewQuillJSEvents.ON_KEY_UP:
                    this.props.onKeyUp(message.payload.event)
                    break
                case WebviewQuillJSEvents.ON_SAVE:
                    this.props.onSave(message.payload.value)
                    break
            }
        } catch (e) {}
    }

    private sendMessage = (payload: object) => {
        this.webViewRef.current?.injectJavaScript(
            `window.postMessage(${JSON.stringify(payload)}, '*');`
        )
    }
}

export default WebViewQuillJS

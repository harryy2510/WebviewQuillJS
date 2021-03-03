import { GDEditor } from './lib'
import { WebviewQuillJSEvents, WebviewQuillJSMessage } from './models'
import { DeltaStatic, Sources, StringMap } from 'quill'
import React, { Component, createRef, RefObject } from 'react'
import { Range, UnprivilegedEditor } from 'react-quill'

interface State {
    formats?: string[]
    modules?: StringMap
    placeholder?: string
    preserveWhitespace?: boolean
    readOnly?: boolean
    initialValue?: string
}

class App extends Component<{}, State> {
    quillComponentRef: RefObject<HTMLDivElement> = createRef()

    constructor(props: any) {
        super(props)
        this.state = {}
    }

    onChange = (value: string, delta: DeltaStatic, source: Sources, editor: UnprivilegedEditor) => {
        this.sendMessage({
            msg: WebviewQuillJSEvents.ON_CHANGE,
            payload: {
                value,
                delta,
                source,
                editor
            }
        })
    }

    onChangeSelection = (range: Range, source: Sources, editor: UnprivilegedEditor) => {
        this.sendMessage({
            msg: WebviewQuillJSEvents.ON_CHANGE_SELECTION,
            payload: {
                range,
                source,
                editor
            }
        })
    }

    onFocus = (range: Range, source: Sources, editor: UnprivilegedEditor) => {
        this.sendMessage({
            msg: WebviewQuillJSEvents.ON_FOCUS,
            payload: {
                range,
                source,
                editor
            }
        })
    }

    onBlur = (previousRange: Range, source: Sources, editor: UnprivilegedEditor) => {
        this.sendMessage({
            msg: WebviewQuillJSEvents.ON_BLUR,
            payload: {
                previousRange,
                source,
                editor
            }
        })
    }

    onKeyDown: React.EventHandler<any> = (event) => {
        this.sendMessage({
            msg: WebviewQuillJSEvents.ON_KEY_DOWN,
            payload: {
                event
            }
        })
    }

    onKeyPress: React.EventHandler<any> = (event) => {
        this.sendMessage({
            msg: WebviewQuillJSEvents.ON_KEY_PRESS,
            payload: {
                event
            }
        })
    }

    onKeyUp: React.EventHandler<any> = (event) => {
        this.sendMessage({
            msg: WebviewQuillJSEvents.ON_KEY_UP,
            payload: {
                event
            }
        })
    }

    onSave = (value: string) => {
        this.sendMessage({
            msg: WebviewQuillJSEvents.ON_SAVE,
            payload: {
                value
            }
        })
    }

    onCancel = () => {
        this.sendMessage({
            msg: WebviewQuillJSEvents.ON_CANCEL
        })
    }

    componentDidMount = () => {
        this.addEventListeners()

        this.sendMessage({
            msg: WebviewQuillJSEvents.QUILLJS_COMPONENT_MOUNTED
        })
    }

    render() {
        const quillProps = this.state
        return (
            <GDEditor
                {...quillProps}
                onChange={this.onChange}
                onChangeSelection={this.onChangeSelection}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onKeyPress={this.onKeyPress}
                onKeyDown={this.onKeyDown}
                onKeyUp={this.onKeyUp}
                onSave={this.onSave}
                onCancel={this.onCancel}
            />
        )
    }

    protected sendMessage = (message: WebviewQuillJSMessage) => {
        // @ts-ignore
        if (window.ReactNativeWebView) {
            // @ts-ignore
            window.ReactNativeWebView.postMessage(JSON.stringify(message))
            console.log('sendMessage  ', JSON.stringify(message))
        }
    }

    private addEventListeners = () => {
        if (document) {
            document.addEventListener('message', this.handleMessage)
            this.sendMessage({
                msg: WebviewQuillJSEvents.DOCUMENT_EVENT_LISTENER_ADDED
            })
        }
        if (window) {
            window.addEventListener('message', this.handleMessage)
            this.sendMessage({
                msg: WebviewQuillJSEvents.WINDOW_EVENT_LISTENER_ADDED
            })
        }
        if (!document && !window) {
            this.sendMessage({
                error: WebviewQuillJSEvents.UNABLE_TO_ADD_EVENT_LISTENER
            })
            return
        }
    }

    private handleMessage = (event: any & { data: State }) => {
        try {
            this.setState({ ...this.state, ...event.data })
        } catch (error) {}
    }
}

export default App

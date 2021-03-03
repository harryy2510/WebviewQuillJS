import { FC, useMemo, useState } from 'react'
import ReactQuill, { ReactQuillProps, UnprivilegedEditor } from 'react-quill'
import Quill, { DeltaStatic, Sources, StringMap } from 'quill'
import 'react-quill/dist/quill.snow.css'
// @ts-ignore
import MagicUrl from 'quill-magic-url'
import './GDEditor.css'
import classNames from 'classnames'
import * as React from 'react'

Quill.register('modules/magicUrl', MagicUrl)

export type GDEditorProps = ReactQuillProps & {
    onSave: (value: string) => void
    onCancel?: () => void
    initialValue?: string
    onImageAdd?: () => void
    onImageClick?: () => void
}

const GDEditor: FC<GDEditorProps> = ({
    initialValue,
    onSave,
    onCancel,
    onImageAdd,
    onImageClick,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false)
    const [value, setValue] = useState(initialValue ?? '')

    const handleChange = (
        value: string,
        delta: DeltaStatic,
        source: Sources,
        editor: UnprivilegedEditor
    ) => {
        const newValue = editor.getText().trim() ? value : ''
        setValue(newValue)
    }

    const handleSave = () => {
        onSave(value)
        setValue('')
    }

    const quillOptions: ReactQuillProps = useMemo(() => {
        const modules: StringMap = {
            magicUrl: true,
            toolbar: props.readOnly
                ? false
                : {
                      container: [
                          'bold',
                          'italic',
                          'underline',
                          'link',
                          ...(onImageAdd ? ['image'] : [])
                      ],
                      handlers: {
                          image: onImageAdd
                      }
                  }
        }
        const formats: string[] = ['bold', 'italic', 'underline', 'list', 'bullet', 'link']
        return { modules, formats }
    }, [onImageAdd])

    return (
        <div
            className={classNames('gd-editor-container', {
                'gd-editor-toolbar-visible': isFocused || value
            })}
        >
            <ReactQuill
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="gd-editor"
                theme="snow"
                {...quillOptions}
                {...props}
                value={value}
                onChange={handleChange}
            />
            <div className="gd-editor-action-buttons">
                {onCancel && (
                    <button onClick={onCancel} className="gd-editor-button">
                        Cancel
                    </button>
                )}
                <button
                    onClick={handleSave}
                    disabled={!value}
                    className="gd-editor-button gd-editor-button--primary"
                >
                    {initialValue ? 'Update' : 'Save'}
                </button>
            </div>
        </div>
    )
}

export default GDEditor

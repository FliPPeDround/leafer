import { IObject } from '../data/IData'
import { InnerId } from '../event/IEventer'

export interface ILeaferImageConfig {
    url: string
    thumb?: string
}

export interface ILeaferImageOnLoaded {
    (image?: ILeaferImage): any
}

export interface ILeaferImageOnError {
    (error?: string | IObject, image?: ILeaferImage): any
}

export interface ILeaferImage {
    readonly innerId: InnerId
    readonly url: string

    view: unknown
    width: number
    height: number

    readonly completed: boolean
    ready: boolean
    error: IObject
    loading: boolean

    use: number
    config: ILeaferImageConfig

    load(onSuccess?: ILeaferImageOnLoaded, onError?: ILeaferImageOnError): number
    unload(index: number): void
    getCanvas(width: number, height: number, opacity?: number, _filters?: IObject): unknown
    destroy(): void
}

export type IImageStatus = 'wait' | 'thumb-loading' | 'thumb-success' | 'thumb-error' | 'loading' | 'success' | 'error' 
import { ILeaferImage, ILeaferImageConfig, IFunction, IObject, InnerId } from '@leafer/interface'
import { Platform } from '@leafer/platform'
import { IncrementId } from '@leafer/math'
import { ImageManager } from './ImageManager'


const { IMAGE, create } = IncrementId

export class LeaferImageBase implements ILeaferImage {

    public readonly innerId: InnerId
    public get url() { return this.config.url }

    public view: any

    public width: number
    public height: number

    public get completed() { return this.ready || !!this.error }

    public ready: boolean
    public error: IObject
    public loading: boolean

    public use = 0

    public config: ILeaferImageConfig

    protected waitComplete: IFunction[] = []

    constructor(config: ILeaferImageConfig) {
        this.config = config
        this.innerId = create(IMAGE)
    }

    public load(onSuccess: IFunction, onError: IFunction): number {
        if (!this.loading) {
            this.loading = true
            ImageManager.tasker.addParallel(async () => await Platform.origin.loadImage(this.config.url).then((img) => {
                this.ready = true
                this.width = img.naturalWidth || img.width
                this.height = img.naturalHeight || img.height
                this.view = img
                this.onComplete(true)
            }).catch((e) => {
                this.error = e
                this.onComplete(false)
            }), null, true)
        }
        this.waitComplete.push(onSuccess, onError)
        return this.waitComplete.length - 2
    }

    public unload(index: number): void {
        const l = this.waitComplete
        const error = l[index + 1]
        if (error) error({ type: 'stop' })
        l[index] = l[index + 1] = undefined
    }

    protected onComplete(isSuccess: boolean): void {
        let odd: number
        this.waitComplete.forEach((item, index) => {
            odd = index % 2
            if (item) {
                if (isSuccess) {
                    if (!odd) item(this)
                } else {
                    if (odd) item(this.error)
                }
            }
        })
        this.waitComplete.length = 0
        this.loading = false
    }

    public getCanvas(width: number, height: number, opacity?: number, _filters?: IObject): any {
        width || (width = this.width)
        height || (height = this.height)
        const canvas = Platform.origin.createCanvas(width, height)
        const ctx = canvas.getContext('2d')
        if (opacity) ctx.globalAlpha = opacity
        ctx.drawImage(this.view, 0, 0, width, height)
        return canvas
    }

    public destroy(): void {
        this.view = null
        this.config = null
    }

}
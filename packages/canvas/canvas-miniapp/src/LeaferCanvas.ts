import { IResizeEventListener, IAutoBounds, IScreenSizeData, IFunction, IMiniappSelect, IObject } from '@leafer/interface'
import { LeaferCanvasBase, canvasPatch, canvasSizeAttrs } from '@leafer/canvas'
import { Platform } from '@leafer/platform'
import { DataHelper } from '@leafer/data'
import { ResizeEvent } from '@leafer/event'

export class LeaferCanvas extends LeaferCanvasBase {

    public get allowBackgroundColor(): boolean { return false }

    protected viewSelect: IMiniappSelect
    protected resizeListener: IResizeEventListener

    public init(): void {
        let { view } = this.config
        if (view) {
            if (typeof view === 'string') {
                if (view[0] !== '#') view = '#' + view
                this.viewSelect = Platform.miniapp.select(view)
            } else if (view.fields) {
                this.viewSelect = view
            } else {
                this.initView(view)
            }

            if (this.viewSelect) Platform.miniapp.getSizeView(this.viewSelect).then(sizeView => {
                this.initView(sizeView)
            })
        } else {
            this.initView()
        }
    }

    protected initView(view?: IObject): void {
        if (!view) {
            view = {}
            this.__createView()
        } else {
            this.view = view.view || view
        }
        this.__createContext()
        const { width, height, pixelRatio } = this.config
        const size = { width: width || view.width, height: height || view.height, pixelRatio }
        this.resize(size)

        // fix roundRect
        if (this.context.roundRect) {
            this.roundRect = function (x: number, y: number, width: number, height: number, radius?: number | number[]): void {
                this.context.roundRect(x, y, width, height, typeof radius === 'number' ? [radius] : radius)
            }
        }
        canvasPatch((this.context as IObject).__proto__)

    }

    protected __createView(): void {
        this.view = Platform.origin.createCanvas(1, 1)
    }

    public updateViewSize(): void {
        const { width, height, pixelRatio } = this

        this.view.width = width * pixelRatio
        this.view.height = height * pixelRatio
    }

    public updateClientBounds(callback?: IFunction): void {
        if (this.viewSelect) Platform.miniapp.getBounds(this.viewSelect).then(bounds => {
            this.clientBounds = bounds
            if (callback) callback()
        })
    }


    public startAutoLayout(_autoBounds: IAutoBounds, listener: IResizeEventListener): void {
        if (!this.offscreen) {
            this.resizeListener = listener
            this.checkSize = this.checkSize.bind(this)
            Platform.miniapp.onWindowResize(this.checkSize)
        }
    }

    public checkSize(): void {
        if (this.viewSelect) {
            setTimeout(() => {
                this.updateClientBounds(() => {
                    const { width, height } = this.clientBounds
                    const { pixelRatio } = this
                    const size = { width, height, pixelRatio }
                    if (!this.isSameSize(size)) {
                        const oldSize = {} as IScreenSizeData
                        DataHelper.copyAttrs(oldSize, this, canvasSizeAttrs)
                        this.resize(size)
                        if (this.width !== undefined) this.resizeListener(new ResizeEvent(size, oldSize))
                    }
                })
            }, 500)
        }
    }

    public stopAutoLayout(): void {
        this.autoLayout = false
        this.resizeListener = null
        Platform.miniapp.offWindowResize(this.checkSize)
    }

}
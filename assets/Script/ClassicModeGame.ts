import { _decorator, Component, SpriteFrame, Animation, UITransform, resources, Prefab, instantiate, Node, math, sys, Label } from 'cc';
const { ccclass, property } = _decorator;
const { Size, Vec3 } = math;

@ccclass('ClassicModeGame')
export class ClassicModeGame extends Component {
    @property({
        type: [SpriteFrame]
    })
    public lightGrid: SpriteFrame[] = []

    @property({
        type: [SpriteFrame]
    })
    public darkGrid: SpriteFrame[] = []
    
    @property({
        type: Label
    })
    private History: Label = null

    @property({
        type: Label
    })
    private Current: Label = null

    @property({
        tooltip: 'block gap'
    })
    public gap: number = 20

    private best: number = 0

    private score: number = 0

    private Block: [Node[], Node[], Node[], Node[]] = [[], [], [], []]

    onLoad() {
        let count = 0;
        let temp = this.node.getComponent(UITransform).width;
        let size = Math.floor((Math.floor(temp * 0.9) - this.gap * 5) / 4);
        let start =  -(temp * 0.45);

        for(let i = 0;i < 4;i++) {
            for(let j = 0;j < 4;j++) {
                resources.load("prefab/ClassicGrid", Prefab, (error, prefab) => {
                    if(error) return count++;

                    let grid = instantiate(prefab);
                    grid.getComponent(UITransform).setContentSize(new Size(size, size));
                    grid.setPosition(new Vec3(
                        start + ((j + 0.5) * size) + ((j + 1) * this.gap), 
                        start + 6 * this.node.scale.x + ((i + 0.5) * size) + ((i + 1) * this.gap), 0));
                        
                    grid.parent = this.node;
                    this.Block[i][j] = grid;
                })
            }
        }

        this.best = parseInt(sys.localStorage.getItem('best')) || 0;
        this.History.string = this.best.toString();
        this.Current.string = this.score.toString();

        this.node.parent.getComponent(Animation).on(Animation.EventType.FINISHED, () => {
            this.init();
        })
    }

    init() {

    }

    textAnimation() {

    }
}


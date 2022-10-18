import { _decorator, Component, SpriteFrame, find, Animation, UITransform, resources, Prefab, instantiate, Node, math, sys, Label, director, Sprite, Tween, UIOpacity } from 'cc';
import { ClassicModeGrid, _2048 } from './ClassicModeGrid';
import { VoiceManager } from './VoiceManager';
import Data from './ClickSwitchSpriteImage';
import { AlertManager } from './AlertManager';
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

    private Block: [
        ClassicModeGrid[], 
        ClassicModeGrid[], 
        ClassicModeGrid[], 
        ClassicModeGrid[]
    ] = [[], [], [], []]

    private firstX = null
    private firstY = null

    @property({
        type: Node,
        tooltip: 'return'
    })
    private step: Node = null
    private steps = []

    @property({
        type: Node,
        tooltip: 'pause'
    })
    private pause: Node = null
    
    @property({
        type: UIOpacity,
        tooltip: 'parent'
    })
    private parent: UIOpacity = null

    private alert = null;

    onLoad() {
        this.score = 0;
        this.parent.opacity = 0;
        this.step.active = false;


        let count = 0;
        let temp = this.node.getComponent(UITransform).width;
        let size = Math.floor((Math.floor(temp * 0.9) - this.gap * 5) / 4);
        let start =  -(temp * 0.45);

        for(let i = 0;i < 4;i++) {
            for(let j = 0;j < 4;j++) {
                if(this.Block[i][j]) {
                    this.Block[i][j].node.removeFromParent();
                    this.Block[i][j] = null;
                }
                resources.load("prefab/ClassicGrid", Prefab, (error, prefab) => {
                    if(error) return count++;

                    let grid = instantiate(prefab);
                    grid.getComponent(UITransform).setContentSize(new Size(size, size));
                    grid.setPosition(new Vec3(
                        start + ((j + 0.5) * size) + ((j + 1) * this.gap), 
                        -start + 12 - (6 * this.node.scale.x + ((i + 0.5) * size) + ((i + 1) * this.gap)), 0));
                        
                    grid.parent = this.node;
                    this.Block[i][j] = grid.getComponent(ClassicModeGrid);
                })
            }
        }


        this.best = parseInt(sys.localStorage.getItem('best')) || 0;
        this.History.string = this.best.toString();
        this.Current.string = this.score.toString();

        let tween = new Tween();
        tween.target(this.parent)
        .to(1, { opacity: 255 })
        .call(() => this.init())
        .start();
    }

    init() {
        this.steps = [];
        // 随机生成2个方块
        this.randomGenerate();
        this.randomGenerate();

        // 记录第一次路径
        let temp: Array<number[]> = [[], [], [], []];
        for(let i = 0;i < 4;i++) {
            for(let j = 0;j < 4;j++) { 
                temp[i][j] = this.Block[i][j].number;
            }
        }
        this.steps.unshift({
            Score: this.score,
            Block: temp
        });

        // 点击滑动方向监听
        this.node.on(Node.EventType.TOUCH_START, (event) => {
            if(this.alert) return;

            let location = event.getLocation();
            this.firstX = location.x;
            this.firstY = location.y;
        }, this)
        this.node.on(Node.EventType.TOUCH_END, (event) => {
            if(this.alert) return;

            let touchPoint = event.getLocation();
            let endX = this.firstX - touchPoint.x;
            let endY = this.firstY - touchPoint.y;

            let temp: Array<number[]> = [[], [], [], []];
            let Block: Array<number[]> = [[], [], [], []];
            let Rocord: Array<number[]> = [[], [], [], []];

            for(let i = 0;i < 4;i++) {
                for(let j = 0;j < 4;j++) { 
                    Rocord[i][j] = Block[i][j] = this.Block[i][j].number;
                }
            }

            if(Math.abs(endX) > 50 || Math.abs(endY) > 50) {
                let _move = false;
                let direction = '';
                let victory = false;
                let _socre = this.score;
                if (Math.abs(endX) > Math.abs(endY)){
                    if (endX  > 0){
                        direction = 'left';
                        // 向左滑动
                        for(let i = 0;i < 4;i++) {
                            for(let j = 0;j < 4;j++) {
                                let [ret, move] = this.alignSort(Block, i, j);
                                if(ret === 0) victory = true;
                                if(ret === 1) continue;
                                if(move) _move = true;
                                if(ret === 2) break;
                                if(ret === 3) j--;
                            }
                        }
                    } else {
                        direction = 'right';
                        // 转置Block
                        for(let i = 0;i < 4;i++) {
                            for(let j = 0;j < 4;j++) { 
                                temp[i][j] = Block[i][3 - j]
                            }
                        }

                        // 向右滑动
                        for(let i = 0;i < 4;i++) {
                            for(let j = 0;j < 4;j++) {
                                let [ret, move] = this.alignSort(temp, i, j);
                                if(ret === 0) victory = true;
                                if(ret === 1) continue;
                                if(move) _move = true;
                                if(ret === 2) break;
                                if(ret === 3) j--;
                            }
                        }

                        // 转置Block
                        for(let i = 0;i < 4;i++) {
                            for(let j = 0;j < 4;j++) { 
                                Block[i][j] = temp[i][3 - j]
                            }
                        }
                    }
                } else {
                    if (endY  > 0){
                        direction = 'bottom';
                        // 转置Block
                        for(let i = 0;i < 4;i++) {
                            for(let j = 0;j < 4;j++) { 
                                temp[i][j] = Block[3 - j][i]
                            }
                        }

                        // 向下滑动
                        for(let i = 0;i < 4;i++) {
                            for(let j = 0;j < 4;j++) {
                                let [ret, move] = this.alignSort(temp, i, j);
                                if(ret === 0) victory = true;
                                if(ret === 1) continue;
                                if(move) _move = true;
                                if(ret === 2) break;
                                if(ret === 3) j--;
                            }
                        }

                        // 转置Block
                        for(let i = 0;i < 4;i++) {
                            for(let j = 0;j < 4;j++) {
                                Block[i][j] = temp[j][3 - i]
                            }
                        }
                    } else {
                        direction = 'top';
                        // 转置Block
                        for(let i = 0;i < 4;i++) {
                            for(let j = 0;j < 4;j++) { 
                                temp[i][j] = Block[j][3 - i]
                            }
                        }

                        // 向上滑动
                        for(let i = 0;i < 4;i++) {
                            for(let j = 0;j < 4;j++) {
                                let [ret, move] = this.alignSort(temp, i, j);
                                if(ret === 0) victory = true;
                                if(ret === 1) continue;
                                if(move) _move = true;
                                if(ret === 2) break;
                                if(ret === 3) j--;
                            }
                        }

                        // 转置Block
                        for(let i = 0;i < 4;i++) {
                            for(let j = 0;j < 4;j++) {
                                Block[i][j] = temp[3 - j][i]
                            }
                        }
                    }
                 }


                let change = _move || this.score !== _socre;
                if(change) this.steps.unshift({
                    Score: _socre,
                    Block: Rocord
                });
                this.redraw(Block, change ? '' : direction);
                if(change) this.randomGenerate();
            }
        }, this)

        // 点击返回上一步
        this.step.on(Node.EventType.TOUCH_END, () => {
            if(this.alert) return;

            if(Data.voice) (find("Voice").getComponent(VoiceManager) as any).playEffect();

            if(this.steps.length > 0) {
                let temp = this.steps.length > 1 ? this.steps.shift() : this.steps[0];
                this.score = temp.Score;
                this.redraw(temp.Block, null);
            }
        })

        // 点击暂停按钮
        this.pause.on(Node.EventType.TOUCH_END, () => {
            if(this.alert) return;

            if(Data.voice) (find("Voice").getComponent(VoiceManager) as any).playEffect();
            resources.load("prefab/PauseAlert", Prefab, (error, prefab) => {
                if(error) return;

                this.alert = instantiate(prefab)
                this.alert.parent = this.node.parent;

                this.alert.getChildByName("Close").once(Node.EventType.TOUCH_END, () => {
                    if(Data.voice) (find("Voice").getComponent(VoiceManager) as any).playEffect();

                    this.alert.getComponent(AlertManager).close(() => {
                        this.alert.removeFromParent();
                        this.alert = null;
                    })
                })

                this.alert.getChildByName("Home").on(Node.EventType.TOUCH_END, () => {
                    if(Data.voice) find("Voice").getComponent(VoiceManager).playEffect();
                    
                    director.loadScene("Main");
                })
            })
        })
    }
    /**
     * @desc 查找空白方格
     * @return 空白方格坐标集合
     */
    checkNullGrid(): Array<[number, number]> {
        let Queen = []

        for(let i = 0;i < 4;i++) {
            for(let j = 0;j < 4;j++) {
                if(this.Block[i][j].sprite === null) Queen.push([i, j]);
            }
        }

        return Queen;
    }

    /**
     * @desc 随机生成方块
     */
    randomGenerate() {
        let grids = this.checkNullGrid();
        if(grids.length > 0) {
            let i = Math.floor(0 + math.random() * (grids.length - 1));
            let num = (Math.round(Math.random()) * 2) + 2 as 2 | 4;
            this.Block[grids[i][0]][grids[i][1]].setNumber(num);
            if(Data.voice) (find("Voice").getComponent(VoiceManager) as any).playEffect('show');

            if(grids.length == 1) {
                if(this.isOver()) {
                    // 结束滑动监听
                    this.node.off(Node.EventType.TOUCH_START);
                    this.node.off(Node.EventType.TOUCH_END);
                    this.step.off(Node.EventType.TOUCH_END);

                    // 记录最好成绩
                    if(this.score > this.best) sys.localStorage.setItem('best', this.score.toString())

                    this.steps = [];
                    this.step.active = false;
                    

                    // 弹出窗口
                    resources.load("prefab/OverAlert", Prefab, (error, prefab) => {
                        if(error) return;

                        if(this.alert) this.alert.removeFromParent();

                        this.alert = instantiate(prefab);

                        this.alert.parent = this.node;

                        this.alert.getChildByName("Close").on(Node.EventType.TOUCH_END, () => {
                            if(Data.voice) find("Voice").getComponent(VoiceManager).playEffect();
                            this.alert.removeFromParent();
                            this.alert = null;
                        })

                        this.alert.getChildByName("Continue").on(Node.EventType.TOUCH_END, () => {
                            if(Data.voice) find("Voice").getComponent(VoiceManager).playEffect();
                            this.alert.removeFromParent();
                            this.alert = null;

                            this.pause.off(Node.EventType.TOUCH_END);
                            this.onLoad();
                        })

                        this.alert.getChildByName("Home").on(Node.EventType.TOUCH_END, () => {
                            if(Data.voice) find("Voice").getComponent(VoiceManager).playEffect();
                            director.loadScene("Main");
                        })
                    })
                }
            }
        }

    }

    /**
     * @desc 方块移动合并
     */
    alignSort(Block: Array<number[]>, i: number, j: number): [number, boolean] {
        let victory = -1;
        let move = false;
        let number = Block[i][j];
        if(number) {
            if(number == 2048) return [1, move];

            // 如果紧挨着下一个数字为空
            if(j !== 3 && Block[i][j + 1] == null) {
                for(let k = j + 2; k < 4;k++) {
                    if(Block[i][k]) {
                        Block[i][j + 1] = Block[i][k];
                        Block[i][k] = null;
                        move = true;
                        break;
                    }
                }
            }

            if(!Block[i][j + 1]) return [2, move];

            // 如果当前和下一个一样
            if(j !== 3 && number === Block[i][j + 1]) {
                let doubleNum = (number *= 2) as _2048;

                // 得出2048，胜利
                if(doubleNum == 2048) victory = 0;

                // 没有胜利，继续加
                Block[i][j] = -doubleNum;
                Block[i][j + 1] = null;
                move = true;

                // 分数++
                this.score += doubleNum;
            }
        } else {
            if(j < 3) {
                for(let k = j + 1; k < 4;k++) {
                    if(Block[i][k]) {
                        Block[i][j] = Block[i][k];
                        Block[i][k] = null;
                        move = true;
                        break;
                    }
                }

                if(!Block[i][j]) return [2, move];

                return [3, move];
            }
        }

        return [victory, move];
    }

    /**
     * @desc 重新绘制
     */
    redraw(Block: Array<number[]>, direction: string = '') {
        this.step.active = this.steps.length > 1;

        if(direction) {
            if(Data.voice) (find("Voice").getComponent(VoiceManager) as any).playEffect('move');

            for(let i = 0;i < 4;i++) {
                for(let j = 0;j < 4;j++) {
                    this.Block[i][j].textAnimation(direction);
                }
            } 
        } else {
            this.Current.string = this.score.toString();
            for(let i = 0;i < 4;i++) {
                for(let j = 0;j < 4;j++) {
                    let number = Block[i][j] as _2048;
                    if(number) {
                        this.Block[i][j].setNumber(number, number < 0);
                    } else {
                        this.Block[i][j].delNumber();
                    }
                }
            }
        }
    }

    /**
     * @desc 判断是否结束
     */
    isOver(): boolean {
        let Block: Array<number[]> = [[], [], [], []];

        for(let i = 0;i < 4;i++) {
            for(let j = 0;j < 4;j++) { 
                Block[i][j] = this.Block[i][j].number;
            }
        }


        for(let i = 0;i < 4;i++) {
            for(let j = 0;j < 4;j++) {
                if(Block[i][j] && j !== 3) {
                    if(!Block[i][j + 1]) {
                        for(let k = j + 2; k < 4;k++) {
                            if(Block[i][k]) {
                                Block[i][j + 1] = Block[i][k];
                                Block[i][k] = null;
                                break;
                            }
                        }
                    }

                    if(Block[i][j] == Block[i][j + 1]) return false;
                }

                if(Block[j][i] && j !== 3) {
                    if(!Block[j + 1][i]) {
                        for(let k = j + 2; k < 4;k++) {
                            if(Block[k][i]) {
                                Block[j + 1][i] = Block[k][i];
                                Block[k][i] = null;
                                break;
                            }
                        }
                    }

                    if(Block[j][i] == Block[j + 1][i]) return false;
                }
            }
        }

        return true;
    }
}


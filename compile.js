//编译器
class Complier{
    constructor(el,vm){
        this.$vm=vm;
        this.$el=document.querySelector(el)
        if(this.$el){
            // 执行编译
            this.complie(this.$el)
        }
    }
    complie(el){
        // 遍历el树
        const childNodes=el.childNodes;
        Array.from(childNodes).forEach(node=>{
            if(this.isElement(node)){
                this.complieElement(node)
            }else if(this.isInter(node)){
                this.compileText(node)
            }
            if(node.childNodes&&node.childNodes.length>0){
                this.complie(node)
            }
        })
    }
    isElement(node){
        return node.nodeType===1
        //判断是不是标签
    }
    isInter(node){
        //判断是不是  {{xxx}} 的文本
        return node.nodeType===3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
    complieElement(node){
        //节点是元素
        //遍历其属性列表
        const nodeAttrs = node.attributes
        Array.from(nodeAttrs).forEach(attr=>{
            //规定  指令以j-xx="zzzz" 定义 
            const attrName = attr.name
            const exp = attr.value 
            if(this.isDirective(attrName)){
                const dir = attrName.substring(2)  //获取xx
                this[dir]&&this[dir](node, exp) //存在this[dir]就执行
            }
        })
    }
    compileText(node){
        // RegExp这个对象会在我们调用了正则表达式的方法后, 自动将最近一次的结果保存在里面 RegExp.$1对应的就是{{}}中内容
        this.update(node,RegExp.$1,'text')
    }

    isDirective(attr){
        //判断是否为指令
        return attr.indexOf('j-')===0
    }

    update(node,exp,dir){
        //指令对应的更新函数为  xxUpdater
        const fn = this[dir+'Updater']
        fn && fn(node,this.$vm[exp])

        // 更新处理  封装一个更新函数，可以更新对应dom元素
        new Watcher(this.$vm,exp,function(val){
            console.log(val)
            fn && fn(node,val)
        })
    }
    
    // j-text
    text(node, exp) {
        this.update(node, exp, 'text')
    }

    textUpdater(node, value) {
        node.textContent = value
    }

    // j-html
    html(node,exp){
        this.update(node, exp, 'html')
    }

    htmlUpdater(node,value){
        node.innerHTML=value
    }

}
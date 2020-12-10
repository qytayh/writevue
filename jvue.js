function defineReactive(obj,key,val){
    //递归
    // observe(val)

    //创建一个Dep与当前key一一对应
    const dep = new Dep()

    //对传入obj进行访问拦截
    Object.defineProperty(obj,key,{
        get(){
            //依赖收集
            Dep.target && dep.addDep(Dep.target)
            return val
        },  
        set(newVal){
            if(newVal!==val){
                console.log('set '+key+': '+newVal)
                observe(newVal)
                val = newVal
                //通知更新
                dep.notify()
                // watchers.forEach(w => w.update())
            }
        }
    })
}


function observe(obj){
    if(typeof obj!=='object' || obj==null){
        //希望传入的是obj
        return
    }
    new Observer(obj)
}


//代理函数，方便用户直接访问$data中的数据
function proxy(vm,sourceKey){
    // 将$data的值代理到vm上
    Object.keys(vm[sourceKey]).forEach(key=>{
        Object.defineProperty(vm,key,{
            get(){
                return vm[sourceKey][key]
            },
            set(newVal){
                vm[sourceKey][key]=newVal
            }
        })
    })
}


// 创建Jvue构造函数
class JVue {
    constructor(options){
        this.$options = options;
        this.$data = options.data;
        //响应化处理
        observe(this.$data)

        // 代理
        proxy(this,'$data')

        //创建编译器
        new Complier(options.el,this)
    }
}

// 根据对象类型决定如何做响应化
class Observer {
    constructor(value){
        this.$value = value
        if(typeof this.$value ==='object'){
            this.walk(this.$value)
        }
    }
    //对象数据响应化
    walk(obj){
        Object.keys(obj).forEach(key=>{
            defineReactive(obj,key,obj[key])
        })
    }
}

//创建观察者 保存更新函数  值发生变化调用更新函数
// const watchers = []
class Watcher{
    constructor(vm,key,updateFn){
        this.vm=vm
        this.key=key
        this.updateFn=updateFn
        // watchers.push(this)

        //Dep.target 静态属性上设置为当前watcher实例
        Dep.target=this
        this.vm[this.key]//读取 触发了getter
        Dep.target = null //收集完置空
    }
    update() {
        this.updateFn.call(this.vm,this.vm[this.key])
    }
}


//Dep:依赖  管理某个key相关的所有Watcher实例
class Dep{
    constructor(){
        this.deps=[]
    }
    addDep(dep){
        this.deps.push(dep)
    }
    notify(){
        this.deps.forEach(dep => dep.update())
    }
}
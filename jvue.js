function defineReactive(obj,key,val){
    //递归
    // observe(val)

    // 创建一个Dep与当前key一一对应
    // const dep = new Dep()

    //对传入obj进行访问拦截
    Object.defineProperty(obj,key,{
        get(){
            console.log('get'+key+" : "+val)
            return val
        },  
        set(newVal){
            if(newVal!==val){
                console.log('set '+key+': '+newVal)
                observe(newVal)
                val = newVal
                
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
        console.log(options)
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
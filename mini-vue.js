let activeEffect

class Dep {
    subscribers = new Set()

    depend(){
        if(activeEffect){
            this.subscribers.add(activeEffect)
        }
    }

    notify(){
        this.subscribers.forEach(effect => {
            effect()
        })
    }
}

let targetMap = new WeakMap()

function getDep(target,key){
    let depsMap = targetMap.get(target)
    if (!depsMap){
        depsMap = new Map()
        targetMap.set(target,depsMap)
    }

    let dep = depsMap.get(key)
    if(!dep){
        dep = new Dep()
        depsMap.set(key,dep)
    }

    return dep
}

const reactiveHandler = {
    get(target,key,receiver){
        const dep = getDep(target,key)
        dep.depend()
        return Reflect.get(target,key,receiver)
    },
    set(target,key,value,receive){
        const dep = getDep(target,key)
        const result = Reflect.set(target,key,value,receive)
        dep.notify()
        return result
    }
}

function reactive(raw){
    return new Proxy(raw,reactiveHandler)
}

function watchEffect(effect){
    activeEffect = effect
    effect()
    activeEffect = undefined
}


function render(){

}

function h(tag,props,children){
    return {
        tag,props,children
    }
}

function mount(vnode,container){
    const el = vnode.el = document.createElement(vnode.tag)

    if(vnode.props){
        for(const key in vnode.props){
            const value = vnode.props[key]
            if(key.startsWith('on')){
                el.addEventListener(key.slice(2).toLowerCase(),value )
            }else {
                el.setAttribute(key,value)
            }
        }
    }

    if(vnode.children){
        if(typeof vnode.children === 'string'){
            el.textContent = vnode. children
        }else {
            vnode.children.forEach(child=>{
                mount(child,el)
            })
        }

    }
    container.appendChild(el)
}

function patch(n1,n2){
   if(n1.tag === n2.tag){
       const el = n2.el  = n1.el
       const oldProps = n1.props || {}
       const newProps = n2.props || {}

       for(const key in newProps){
           const oldValue = oldProps[key]
           const newvalue = newProps[key]
           if(newvalue!==oldValue){
                el.setAttribute(key,newvalue)
           }
       }

       for(const key in oldProps){
            if(!key in newProps){
                el.removeAttribute(key)
            }
       }

       const  oldChildren = n1.children
       const newChildren = n2.children

       if(typeof newChildren === 'string'){
           if(typeof oldChildren==='string'){
               if (oldChildren!==newChildren){
                   el.textContent = newChildren
               }
           }else {
               el.textContent = newChildren
           }
       }else {
            if(typeof oldChildren === 'string'){
                 el.innerHTML = ''
                newChildren.forEach(child=>{
                    mount(child,el)
                })
            }else {
                let len = Math.min(oldChildren.length,newChildren.length)
                for(let i = 0;i<len;i++){
                    patch(oldChildren[i],newChildren[i])
                }
                if(newChildren.length>oldChildren.length){
                   newChildren.slice(oldChildren.length).forEach(child=>{
                       mount(child,el )
                   })
                }else if(newChildren.length<oldChildren.length){
                    oldChildren.slice(newChildren.length).forEach(child=>{
                        el.removeChild(child.el)
                    })
                }
            }
       }



   }

}


function mountApp(component,container){
    let isMounted = false
    let prevVdom
    watchEffect(()=>{
        if(!isMounted){
            prevVdom = component.render()
            mount(prevVdom,container)
            isMounted = true
        }else{
            const newVdom = component.render()
            patch(prevVdom,newVdom)
            prevVdom = newVdom
        }
    })
}


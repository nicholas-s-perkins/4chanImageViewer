module Viewer{
    interface Iterator{
        (element: HTMLElement, index?: number): void;
    }

    /**
     * Didn't want to use any external libraries.  This is my handy library for dealing with the DOM
     */
    export class DomUtil{
            private _elements:Array<HTMLElement>;
            private _listeners:Array<Listener>;

            constructor(obj?:NodeList|HTMLElement|Window){
                this._elements = [];
                this._listeners = [];
                if(obj){
                    if(obj instanceof NodeList){
                        for(var i = 0; i < obj.length; ++i){
                            this._elements.push(<HTMLElement>obj[i]);
                        }
                    }else{
                        this._elements.push(<HTMLElement>obj);
                    }
                }
            }

            public get elementList():Array<HTMLElement>{
                return this._elements;
            }

            public concat(collection:NodeList|DomUtil):DomUtil{
                if(collection instanceof DomUtil){
                    this._elements =  this._elements.concat(collection._elements);
                }else{
                    this._elements =  this._elements.concat(DomUtil.formatNodeList(<NodeList>collection));
                }
                return this;
            }

            /** Adds a click handler */
            public on(handler:string,func:EventListenerOrEventListenerObject):DomUtil{
                var handlers = handler.split(' ');

                this.each((element)=>{
                    for(let handler of handlers){
                        this._listeners.push(new Listener(element,handler,func));
                        element.addEventListener(handler,func,false);
                    }
                });

                return this;
            }

            public appendTo(obj:string|DomUtil|HTMLElement):DomUtil{
                if(typeof obj === 'string'){
                    DomUtil.get(obj).append(this);
                }else if(obj instanceof DomUtil){
                    obj.append(this);
                } else{
                    new DomUtil(<HTMLElement>obj).append(this);
                }
                return this;
            }


            public off(handlerType?:string):DomUtil{
                var remaining:Array<Listener> = [];
                for (let listener of this._listeners) {
                    if(handlerType == null || listener.type === handlerType){
                        listener.element.removeEventListener(listener.type,listener.func);
                    }else{
                        remaining.push(listener);
                    }
                }
                this._listeners = remaining;
                return this;
            }

            public remove():DomUtil{
                for (let element of this._elements) {
                    if(element.parentElement){
                        element.parentElement.removeChild(element);
                    }
                }
                return this;
            }
            public prepend(obj:DomUtil):DomUtil{
                for (let thisElement of this._elements) {
                    for (let objElement of obj._elements) {
                        if(thisElement.parentElement){
                            thisElement.parentElement.insertBefore(objElement,thisElement);
                        }
                    }
                }
                return this;
            }


            public append(obj:HTMLElement|DomUtil|string):DomUtil{
                if(typeof obj === 'string'){
                    this.each((element)=>{
                        element.insertAdjacentHTML('beforeend',obj);
                    });
                } else if(obj instanceof DomUtil){
                    for (let element of this._elements) {
                        for (let objEle of obj._elements) {
                            element.appendChild(objEle);
                        }
                    }
                }else{
                    for (let element of this._elements) {
                        element.appendChild(<HTMLElement>obj);
                    }
                }
                return this;
            }

            public empty():DomUtil{
                this.each((element)=>{
                    while (element.firstChild) {
                        element.removeChild(element.firstChild);
                    }
                });

                return this;
            }


            public scrollToTop():DomUtil{
                if(this._elements.length > 0 ){
                    this._elements[0].scrollTop = 0;
                }
                return this;
            }
            public focus():DomUtil{
                if(this._elements.length > 0 ){
                    this._elements[0].focus();
                }
                return this;
            }

            public set tabIndex(index:number){
                if(this._elements.length > 0 ){
                    this._elements[0].tabIndex = index;
                }
            }

            public setAttr(attr:string,value:any):DomUtil{
                this.each((element:any)=>{
                    element[attr] = value;
                });

                return this;
            }


            public setStyle(styleConfig:any):DomUtil{
                for (let element of this._elements) {
                    for(let propName in styleConfig){
                        element.style[propName] = styleConfig[propName];
                    }
                }
                return this;
            }
            public setData(data:any):DomUtil{
                for (let element of this._elements) {
                    for(let propName in data){
                        element.dataset[propName] = data[propName];
                    }
                }
                return this;
            }

            public replaceWith(replacement:DomUtil):DomUtil{
                var replaceEle = replacement._elements;
                this.each((element)=>{
                    if(element.parentElement){
                        for(let i = replaceEle.length - 1; i >=0; i--){
                            element.parentElement.insertBefore(replaceEle[i],element);
                        }
                        element.parentElement.removeChild(element);
                    }
                });

                return this;
            }

            public html(html:string|DomUtil):DomUtil{
                if(typeof html === 'string'){
                    for (let element of this._elements) {
                        element.innerHTML = html;
                    }
                }else{
                    this.each((element)=>{
                       DomUtil.get(element).remove();
                    });
                    this.append(html);
                }

                return this;
            }


            public get length():number{
                return this._elements.length;
            }

            public get id():string{
                return this._elements.length > 0 ? this._elements[0].id : null;
            }
            public get clientHeight():number{
                return this._elements.length > 0 ? this._elements[0].clientHeight : 0;
            }
            public get clientWidth():number{
                return this._elements.length > 0 ? this._elements[0].clientWidth : 0;
            }
            public get offsetHeight():number{
                return this._elements.length > 0 ? this._elements[0].offsetHeight : 0;
            }
            public get offsetWidth():number{
                return this._elements.length > 0 ? this._elements[0].offsetWidth : 0;
            }

            public get tagName():string{
                return this._elements.length > 0 ? this._elements[0].tagName : null;
            }

            public hasClass(className:string):boolean{
                return this._elements.length > 0 ? this._elements[0].classList.contains(className) : false;
            }


            public getAttr(attr:string):any{
                if(this._elements.length > 0){
                    var ele:any = this._elements[0];
                    return ele[attr];
                }else{
                    return null;
                }
            }
            public lightClone():DomUtil{
                var newCollection = new DomUtil();
                this.each((element)=>{
                    var newEle = document.createElement(element.tagName);
                    newEle.className = element.className;
                    newEle.innerHTML = element.innerHTML;
                    newCollection._elements.push(newEle);
                });
                return newCollection;
            }

            public addClass(...classNames: string[]):DomUtil{
                this.each((element)=>{
                    element.classList.add.apply(element.classList,classNames);
                });
                return this;
            }

            public removeClass(... classNames:string[]):DomUtil{
                this.each((element)=>{
                    element.classList.remove.apply(element.classList,classNames);
                });
                return this;
            }

            public each(func:Iterator):DomUtil{
                for(let i = 0; i < this._elements.length; ++i){
                    func(this._elements[i],i);
                }
                return this;
            }



            /** Finds all sub-elements matching the queryString */
            public find(queryString:string):DomUtil{
                var collection:DomUtil = new DomUtil();
                for (let element of this._elements) {
                    collection.concat(element.querySelectorAll(queryString));
                }
                return collection;
            }


            public get exists():boolean{
                return this._elements.length > 0;
            }

            /** because screw node lists */
            private static formatNodeList(nodes:NodeList):Array<HTMLElement>{
                var arr:Array<HTMLElement> = [];
                for(let i = 0; i < nodes.length; ++i){
                    arr.push(<HTMLElement>nodes[i]);
                }

                return arr;
            }

            public static get(query:string|HTMLElement|Window):DomUtil{
                if(typeof query === 'string'){
                    switch(query){
                        case 'body':
                            return  new DomUtil(document.body);
                        case 'head':
                            return new DomUtil(document.head);
                        default:
                            var nodes:NodeList = document.querySelectorAll(query);
                            return new DomUtil(nodes);
                    }
                }else{
                    return new DomUtil(query);
                }


            }
            public static getById(id:string):DomUtil{
                var ele = document.getElementById(id);
                return new DomUtil(ele);
            }

            public static  createElement(tagName:string,props?:any):DomUtil{
                var ele:any = document.createElement(tagName);
                if(props){
                    for(let propName in props){
                        if(props.hasOwnProperty(propName)){
                            if(propName === 'style'){
                                for(let styleName in props[propName]){
                                    if(props.style.hasOwnProperty(styleName)){
                                        ele.style[styleName] = props.style[styleName]
                                    }
                                }
                            }else{
                                ele[propName] = props[propName];
                            }
                        }
                    }
                }

                return new DomUtil(ele);
            }
        }

        export class Listener{
            type:string;
            func:EventListenerOrEventListenerObject;
            element:HTMLElement;

            constructor(element:HTMLElement,type:string, func:EventListenerOrEventListenerObject) {
                this.type = type;
                this.func = func;
                this.element = element;
            }
        }




}



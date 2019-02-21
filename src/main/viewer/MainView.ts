module Viewer {
    //cookieInfo
    const INDEX_KEY: string = "imageBrowserIndexCookie";
    const THREAD_KEY: string = "imageBrowserThreadCookie";
    const WIDTH_KEY: string = "imageBrowserWidthCookie";
    const HEIGHT_KEY = "imageBrowserHeightCookie";

    //keycode object.  Better than remembering what each code does.
    const KEYS: any = {38: 'up', 40: 'down', 37: 'left', 39: 'right', 27: 'esc', 86: 'v'};

    const BODY = DomUtil.get(document.body);
    const WINDOW = DomUtil.get(window);
    const UNSAFE_WINDOW = DomUtil.get(typeof unsafeWindow === 'undefined' ? window : unsafeWindow);

    export class MainView {
        public postData: Array<PostData> = [];
        public linkIndex: number = 0;

        //elements to keep track of
        private mainView: DomUtil;
        private mainImg: DomUtil;
        private centerBox: DomUtil;
        private topLayer: DomUtil;
        private customStyle: DomUtil;
        private textWrapper: DomUtil;
        private leftArrow: DomUtil;
        private rightArrow: DomUtil;
        private bottomMenu: DomUtil;

        /** Determines if pre-loading can happen*/
        private canPreload: boolean = false;

        /** determines if height of the image should be fit */
        private shouldFitHeight: boolean = false;

        /** Keeps track of the process watching the mouse */
        private mouseTimer?: number;
        public lastMousePos: any = {x: 0, y: 0};


        constructor(imagePostIndex?: number) {
            console.log("Building 4chan Image Viewer");
            const currentThreadId = DomUtil.get('.thread').id;

            if (imagePostIndex != undefined) {
                this.linkIndex = imagePostIndex;
                MainView.setPersistentValue(INDEX_KEY, imagePostIndex);
            }

            //check if its the last thread opened, if so, remember where the index was.
            else if (MainView.getPersistentValue(THREAD_KEY) === currentThreadId) {
                const savedVal = MainView.getPersistentValue(INDEX_KEY);
                if(savedVal != undefined){
                    this.linkIndex = parseInt(savedVal);
                }else{
                    this.linkIndex = 0;
                }
            } else {
                this.linkIndex = 0;
                MainView.setPersistentValue(INDEX_KEY, 0);
            }

            //set thread id
            MainView.setPersistentValue(THREAD_KEY, currentThreadId);

            //Create postData based on 4chan posts
            this.postData = PostData.getImagePosts(true);

            if (this.linkIndex > (this.postData.length - 1)) {
                alert('Last saved image index is too large, a thread may have been deleted.  Index will be reset. ');
                this.linkIndex = 0;
                MainView.setPersistentValue(INDEX_KEY, 0)
            }


            //set shouldFit Height so image can know about it if it loads before menuInit()
            const isHeight = MainView.getPersistentValue(HEIGHT_KEY);
            this.shouldFitHeight = isHeight ? true : false;

            const menuHtml = `
                <label><input id="${WIDTH_KEY}" type="checkbox" checked="checked" />Fit Image to Width</label>
                <span>|</span>
                <label><input id="${HEIGHT_KEY}" type="checkbox" />Fit Image to Height</label>
            `;

            const viewFrag = `
                <style id="${STYLE_ID}">${STYLE_TEXT}</style>
                <div id="${VIEW_ID}">
                    <div id="${CENTER_BOX_ID}">
                        <div id="${IMG_WRAPPER_ID}">
                            <img id="${IMG_ID}" class="hideCursor"/>
                        </div>
                        <div id="${TEXT_WRAPPER_ID}"></div>
                    </div>
                    <div id="${LEFT_ARROW}" class="pagingButtons hidden"><span>&#9001;</span></div>
                    <div id="${RIGHT_ARROW}" class="pagingButtons hidden"><span>&#9002;</span></div>
                </div>
                <div id="${TOP_LAYER_ID}">&nbsp;</div>
                <form id="${MENU_ID}" class="hidden">${menuHtml}</form>
            `;

            BODY.append(viewFrag);
            this.mainView = DomUtil.getById(VIEW_ID);
            this.centerBox = DomUtil.getById(CENTER_BOX_ID);
            this.mainImg = DomUtil.getById(IMG_ID);
            this.textWrapper = DomUtil.getById(TEXT_WRAPPER_ID);
            this.topLayer = DomUtil.getById(TOP_LAYER_ID);
            this.customStyle = DomUtil.getById(STYLE_ID);
            this.bottomMenu = DomUtil.getById(MENU_ID);
            this.leftArrow = DomUtil.getById(LEFT_ARROW);
            this.rightArrow = DomUtil.getById(RIGHT_ARROW);

            //add handlers
            this.centerBox.on('click', () => {
                this.confirmExit()
            });
            this.textWrapper.on('click', (event) => {
                this.eventStopper(event);
            });
            this.bottomMenu.on('click', () => {
                this.menuClickHandler();
            });

            this.leftArrow.on('click', (event) => {
                event.stopImmediatePropagation();
                this.previousImg();
            });
            this.rightArrow.on('click', (event) => {
                event.stopImmediatePropagation();
                this.nextImg();
            });


            //build first image/video tag
            this.changeData(0);

            //initialize menu
            this.menuInit();


            //start preloading to next image index
            this.canPreload = true;
            window.setTimeout(() => {
                this.runImagePreloading(this.linkIndex);
            }, 100);


            //some fixes for weird browser behaviors
            this.centerBox.setStyle({outline: '0'});
            this.centerBox.tabIndex = 1;
            this.centerBox.focus();

            //add keybinding listener, unsafeWindow is used here instead because at least in Tampermonkey
            //the safe window can fail to remove event listeners.
            UNSAFE_WINDOW
                .on('keydown', (event: Event) => {
                    this.arrowKeyListener(event as KeyboardEvent);
                })
                .on('mousemove', (event: Event) => {
                    this.menuWatcher(event as MouseEvent)
                });
        }

        menuInit() {
            const menuControls = this.bottomMenu.find('input');

            menuControls.each((input: HTMLElement) => {
                const typedInput = input as HTMLInputElement;
                const cookieValue = MainView.getPersistentValue(input.id);
                if (cookieValue === 'true') {
                    typedInput.checked = true;
                } else if (cookieValue === 'false') {
                    typedInput.checked = false;
                }
                typedInput.parentElement!.classList.toggle('flash', typedInput.checked);
                switch (typedInput.id) {
                    case WIDTH_KEY:
                        this.setFitToScreenWidth(typedInput.checked);
                        break;
                    case HEIGHT_KEY:
                        this.setFitToScreenHeight(typedInput.checked);
                        break;
                }
            });


        }

        menuClickHandler() {
            const menuControls = this.bottomMenu.find('input');
            menuControls.each((ele: HTMLElement) => {
                const input = ele as HTMLInputElement;
                switch (input.id) {
                    case WIDTH_KEY:
                        this.setFitToScreenWidth(input.checked);
                        break;

                    case HEIGHT_KEY:
                        this.setFitToScreenHeight(input.checked);
                        break;
                }

                input.parentElement!.classList.toggle('flash', input.checked);

                MainView.setPersistentValue(input.id, input.checked);
            });
        }

        windowClick(event: Event) {
            if (!this) {
                return;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            this.nextImg();
        }


        /* Event function for determining behavior of viewer keypresses */
        arrowKeyListener(event: KeyboardEvent) {
            switch (KEYS[event.keyCode]) {
                case 'right':
                    this.nextImg();
                    break;

                case 'left':
                    this.previousImg();
                    break;

                case 'esc':
                    this.destroy();
                    break;
            }
        }

        /* preloads images starting with the index provided */
        runImagePreloading(index: number) {
            if (this && index < this.postData.length) {
                if (this.canPreload) {
                    //console.log('preloading: ' + index +' of '+(this.postData.length - 1) +' | '+ this.postData[index].imgSrc);
                    const loadFunc = () => {
                        this.runImagePreloading(index + 1);
                    };

                    //have yet to figure out how to properly preload video, skip for now
                    if (this.postData[index].tagType === TagType.VIDEO) {
                        window.setTimeout(loadFunc, 1);

                    } else {
                        const newImage: any = document.createElement(this.postData[index].tagTypeName);

                        switch (this.postData[index].tagType) {
                            case TagType.VIDEO:
                                newImage.oncanplaythrough = loadFunc;
                                break;
                            case TagType.IMG:
                                newImage.onload = loadFunc;
                                break;
                        }
                        newImage.onerror = () => {
                            console.log("imageError");
                            this.runImagePreloading(index + 1);
                        };

                        newImage.src = this.postData[index].imgSrc;
                    }

                }
            }
        }

        /* Sets the img and message to the next one in the list*/
        nextImg() {
            if (this.linkIndex === this.postData.length - 1) {
                this.topLayer.setStyle({
                    background: 'linear-gradient(to right,rgba(0,0,0,0) 90%,rgba(125,185,232,1) 100%)',
                    opacity: '.5',
                    visibility: 'visible'
                });

                window.setTimeout(() => {
                    this.topLayer.setStyle({
                        opacity: '0',
                        visibility: 'hidden'
                    });
                }, 500);
            } else {
                this.changeData(1);
            }
        }

        /* Sets the img and message to the previous one in the list*/
        previousImg() {
            if (this.linkIndex === 0) {
                this.topLayer.setStyle({
                    background: 'linear-gradient(to left,rgba(0,0,0,0) 90%,rgba(125,185,232,1) 100%)',
                    opacity: '.5',
                    visibility: 'visible'
                });
                window.setTimeout(() => {
                    this.topLayer.setStyle({opacity: '0'});
                    window.setTimeout(() => {
                        this.topLayer.setStyle({visibility: 'hidden'});
                    }, 200);
                }, 500);

            } else {
                this.changeData(-1);
            }
        }


        changeData(delta: number) {
            MainView.cleanLinks();
            //ignore out of bounds
            const newIndex = this.linkIndex + delta;
            if (newIndex > this.postData.length - 1 || newIndex < 0) {
                return;
            }

            if (this.postData[newIndex].tagTypeName !== this.mainImg.tagName || delta === 0) {
                this.mainImg = this.replaceElement(this.mainImg, this.postData[newIndex].tagTypeName);
            }

            //console.log('Opening: "' + this.postData[this.linkIndex].imgSrc +'" at index ' + this.linkIndex);
            this.mainImg.setAttr('src', this.postData[newIndex].imgSrc);

            let nextLinks: DomUtil = this.postData[newIndex].linksContainer;
            let nextQuote: DomUtil = this.postData[newIndex].quoteContainer;
            this.textWrapper.empty();
            this.textWrapper.append(nextLinks);
            this.textWrapper.append(nextQuote);

            this.linkIndex = newIndex;
            this.mainView.scrollToTop();
            MainView.setPersistentValue(INDEX_KEY, this.linkIndex);
        }

        static cleanLinks() {
            const links = document.getElementsByClassName('quotelink');
            for (let i = 0; i < links.length; ++i) {
                links[i].dispatchEvent(new MouseEvent('mouseout'));
            }
        }


        replaceElement(element: DomUtil, newTagType: string) {
            const rawElement = element.elementList[0];

            const newElement = DomUtil.createElement(newTagType, {
                id: element.id,
                className: rawElement.className,
                style: rawElement.style,
                autoplay: true,
                controls: false,
                loop: true
            });

            newElement
                .on('click', (event) => {
                    event.stopPropagation();
                    this.nextImg();
                })
                .on('load', () => {
                    this.imageLoadHandler();
                })
                .on('progress', (e) => {
                    //console.log(e);
                });

            element.prepend(newElement);
            element.remove();

            return newElement;
        }


        eventStopper(event: any) {
            event.stopPropagation();
            if (event.target.nodeName === 'A') {
                const confirmed = this.confirmExit('Exit Viewer to navigate to link?');
                if (!confirmed) {
                    event.preventDefault();
                }
            }
        }

        confirmExit(message?: string) {
            const confirmed = window.confirm(message || 'Exit Viewer?');
            if (confirmed) {
                this.destroy();
            }
            return confirmed;
        }


        /* Removes the view and cleans up handlers*/
        destroy() {
            MainView.cleanLinks();
            UNSAFE_WINDOW.off();
            WINDOW.off();
            BODY.off();
            this.topLayer.remove();
            this.mainView.remove();
            this.customStyle.remove();
            this.bottomMenu.remove();

            BODY.setStyle({overflow: 'auto'});

            this.canPreload = false;
        }


        /*Mouse-move Handler that watches for when menus should appear and mouse behavior*/
        menuWatcher(event: any) {

            const height_offset = window.innerHeight - this.bottomMenu.offsetHeight;
            const width_offset = window.innerWidth - this.bottomMenu.offsetWidth;
            const center = window.innerHeight / 2;
            const halfArrow = this.leftArrow.offsetHeight / 2;

            if (event.clientX >= width_offset && event.clientY >= height_offset) {
                this.bottomMenu.removeClass('hidden').addClass('bottomMenuShow');

            } else if (this.bottomMenu.hasClass('bottomMenuShow')) {
                this.bottomMenu.removeClass('bottomMenuShow').addClass('hidden');
            }

            if ((event.clientX <= (100) || event.clientX >= (window.innerWidth - 100)) &&
                (event.clientY <= (center + halfArrow) && event.clientY >= (center - halfArrow))) {
                this.rightArrow.removeClass('hidden');
                this.leftArrow.removeClass('hidden');
            } else {
                this.rightArrow.addClass('hidden');
                this.leftArrow.addClass('hidden');
            }

            //avoids chrome treating mouseclicks as mousemoves
            if (event.clientX !== this.lastMousePos.x && event.clientY !== this.lastMousePos.y) {
                //mouse click moves to next image when invisible
                this.mainImg.removeClass('hideCursor');

                window.clearTimeout(this.mouseTimer);
                BODY.off('click');
                BODY.removeClass('hideCursor');

                this.textWrapper.removeClass('disableClick');
                this.mainImg.removeClass('disableClick');
                this.centerBox.removeClass('disableClick');

                if (event.target.id === this.mainImg.id) {
                    //hide cursor if it stops, show if it moves
                    this.mouseTimer = window.setTimeout(() => {
                        this.mainImg.addClass('hideCursor');
                        this.textWrapper.addClass('disableClick');
                        this.mainImg.addClass('disableClick');
                        this.centerBox.addClass('disableClick');
                        BODY.addClass('hideCursor')
                            .on('click', (event) => {
                                this.windowClick(event);
                            });
                    }, 200);
                }

            }

            this.lastMousePos.x = event.clientX;
            this.lastMousePos.y = event.clientY;

        }


        /*Stores a key value pair as a cookie*/
        static setPersistentValue(key: string, value: any) {
            document.cookie = key + '=' + value + ';expires=Thu, 01 Jan 3000 00:00:00 UTC;domain=.4chan.org;path=/';
        }

        /* Retrieves a cookie value via its key*/
        static getPersistentValue(key: string): string | undefined {
            const cookieMatch = document.cookie.match(new RegExp(key + '\\s*=\\s*([^;]+)'));
            if (cookieMatch) {
                return cookieMatch[1];
            } else {
                return undefined;
            }
        }

        setFitToScreenHeight(shouldFitImage: boolean) {
            this.shouldFitHeight = shouldFitImage;
            //ignore if image has no height as it is likely not loaded.
            if (shouldFitImage && this.mainImg.getAttr('naturalHeight')) {
                this.fitHeightToScreen();
            } else {
                this.mainImg.setStyle({maxHeight: ''});
            }
        };

        setFitToScreenWidth(shouldFitImage: boolean) {
            this.mainImg.setStyle({
                maxWidth: shouldFitImage ? '100%' : 'none'
            });
        }


        imageLoadHandler() {
            if (this.shouldFitHeight) {
                this.fitHeightToScreen();
            }
        }

        /* Fits image to screen height*/
        fitHeightToScreen() {
            //sets the changeable properties to the image's real size
            const height: number = this.mainImg.getAttr('naturalHeight');
            this.mainImg.setStyle({maxHeight: (height + 'px')});

            //actually tests if it is too high including padding
            const heightDiff = (this.mainImg.clientHeight > height) ?
                this.mainImg.clientHeight - this.mainView.clientHeight :
                height - this.mainView.clientHeight;

            if (heightDiff > 0) {
                this.mainImg.setStyle({maxHeight: (height - heightDiff) + 'px'});
            } else {
                this.mainImg.setStyle({maxHeight: (height + 'px')});
            }
        }
    }
}

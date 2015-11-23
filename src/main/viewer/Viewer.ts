/// <reference path="../MetaData.ts"/>
/// <reference path="DomUtil.ts"/>
/// <reference path="Css.ts"/>
/// <reference path="MainView.ts"/>
/// <reference path="PostData.ts"/>

declare var unsafeWindow:Window;
//4chan library
declare var Main:any;

module Viewer {
    export function main():void {
    // ========= Build the main Button ========= //
        DomUtil.createElement('button')
            .setStyle({position: 'fixed',bottom: '0',right: '0',})
            .html("Open Viewer")
            .on('click', function () {
                new MainView();
            })
            .appendTo(document.body);


    // ========= Build buttons for each image thumbnail ========= //
        var posts:Array<PostData> = PostData.getImagePosts(false);
        var imagePostCount = 0;
        for (let post of posts) {
            DomUtil.createElement('button')
                .setStyle({
                    display: 'inline',
                    float: 'left',
                    clear: 'both',
                    fontSize: '11px',
                    cursor: 'pointer'
                })
                .setData({
                    postIndex: imagePostCount
                })
                .html('Open Viewer')
                .on('click', function (e:Event) {
                    e.preventDefault();
                    e.stopPropagation();
                    //make the viewer and put it on the window so we can clean it up later
                    new MainView(parseInt(this.dataset.postIndex));
                })
                .appendTo(post.imageLink);

            ++imagePostCount;
        }

    }
}
//run the module
Viewer.main();










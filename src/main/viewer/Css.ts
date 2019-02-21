module Viewer {
    //IDs for important elements
    export const VIEW_ID = "mainView";
    export const IMG_ID = "mainImg";
    export const CENTER_BOX_ID = "imageBox";
    export const TOP_LAYER_ID = "viewerTopLayer";
    export const IMG_WRAPPER_ID = 'mainImgWrapper';
    export const TEXT_WRAPPER_ID = 'viewerTextWrapper';
    export const STYLE_ID = 'viewerStyle';
    export const MENU_ID = 'viewerBottomMenu';
    export const LEFT_ARROW = 'previousImageButton';
    export const RIGHT_ARROW = 'nextImageButton';

    export const STYLE_TEXT = `
        div.reply.highlight,div.reply.highlight-anti{z-index:100 !important;position:fixed !important; top:1%;left:1%;}
        body{overflow:hidden !important;}
        #quote-preview{z-index:100;}
        a.quotelink, div.viewerBacklinks a.quotelink{color:#5c5cff !important;}
        a.quotelink:hover, div.viewerBacklinks a:hover{color:red !important;}
        #${IMG_ID}{display:block !important; margin:auto;max-width:100%;height:auto;-webkit-user-select: none;cursor:pointer;}
        #${VIEW_ID}{
            background-color:rgba(0,0,0,0.9);
            z-index:10;
            position:fixed;
            top:0;left:0;bottom:0;right:0;
            overflow:auto;
            text-align:center;
            -webkit-user-select: none;
        }
        #${CENTER_BOX_ID} {display:flex;align-items:center;justify-content:center;flex-direction: column;min-height:100%;}
        #${IMG_WRAPPER_ID} {width:100%;}
        #${TOP_LAYER_ID}{position:fixed;top:0;bottom:0;left:0;right:0;z-index:20;opacity:0;visibility:hidden;transition:all .25s ease;}
        .viewerBlockQuote{color:white;}
        #${TEXT_WRAPPER_ID}{max-width:60em;display:inline-block; color:gray;-webkit-user-select: all;}
        .bottomMenuShow{visibility:visible;}
        #${MENU_ID}{box-shadow: -1px -1px 5px #888888;font-size:20px;padding:5px;background-color:white;position:fixed;bottom:0;right:0;z-index:200;}
        .hideCursor{cursor:none !important;}
        .hidden{visibility:hidden}
        .displayNone{display:none;}
        .pagingButtons{font-size:100px;color:white;text-shadow: 1px 1px 10px #27E3EB;z-index: 11;top: 50%;position: fixed;margin-top: -57px;width:100px;cursor:pointer;-webkit-user-select: none;}
        .pagingButtons:hover{color:#27E3EB;text-shadow: 1px 1px 10px #000}
        #${LEFT_ARROW}{left:0;text-align:left;}
        #${RIGHT_ARROW}{right:0;text-align:right;}
        @-webkit-keyframes flashAnimation{0%{ text-shadow: none;}100%{text-shadow: 0px 0px 5px blue;}}
        .flash{-webkit-animation: flashAnimation 1s alternate infinite  linear;cursor:pointer;}
        .disableClick, .disableClick a{pointer-events: none;}
        `;
}

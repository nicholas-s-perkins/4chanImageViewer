module Viewer {
    export enum TagType {
        IMG, VIDEO
    }

    export class PostData {
        public imgSrc: string;
        public quoteContainer: DomUtil;
        public linksContainer: DomUtil;
        public imageLink: DomUtil;
        public tagType: TagType;

        constructor(imgSrc: string, quoteContainer: DomUtil, linksContainer: DomUtil, imageLink: DomUtil) {
            this.imgSrc = imgSrc;
            this.linksContainer = linksContainer;
            this.quoteContainer = quoteContainer;
            this.tagType = PostData.getElementType(imgSrc);
            this.imageLink = imageLink;
        }


        public get tagTypeName(): string {
            return TagType[this.tagType];
        }


        private static getElementType(src: string): TagType {
            if (src.match(/\.(?:(?:webm)|(?:ogg)|(?:mp4))$/)) {
                return TagType.VIDEO;
            } else {
                return TagType.IMG;
            }
        }

        private static add4chanListenersToLinks(linkCollection: DomUtil) {
            linkCollection.find('.quotelink')
                .on('mouseover', Main.onThreadMouseOver)
                .on('mouseout', Main.onThreadMouseOut);
        }


        public static getImagePosts(asCopy: boolean): Array<PostData> {
            var postData: Array<PostData> = [];
            var postFiles = DomUtil.get('#delform').find('.postContainer');

            postFiles.each((post) => {
                var _post = DomUtil.get(post);

                var currentLinkTag = _post.find('.file .fileThumb');
                var currentLink = currentLinkTag.getAttr('href');
                if (!currentLink) {
                    return;
                }

                var currentPostBlock = _post.find('.postMessage');
                var currentPostBacklinks = _post.find('.backlink');

                var newPostBlock: DomUtil = currentPostBlock;
                var newBackLinks: DomUtil = currentPostBacklinks;
                if (asCopy) {
                    if (currentPostBlock.exists) {
                        newPostBlock = currentPostBlock.lightClone();
                        newPostBlock.addClass('viewerBlockQuote');
                        PostData.add4chanListenersToLinks(newPostBlock);
                    }
                    if (currentPostBacklinks.exists) {
                        newBackLinks = currentPostBacklinks.lightClone();
                        newBackLinks.addClass('viewerBacklinks');
                        PostData.add4chanListenersToLinks(newBackLinks);
                    }
                }

                postData.push(new PostData(currentLink, newPostBlock, newBackLinks, currentLinkTag));
            });

            return postData;
        }
    }
}


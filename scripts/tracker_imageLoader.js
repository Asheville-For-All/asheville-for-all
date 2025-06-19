export class ImageLoader {
    constructor(){

        this.doneCount = 0;

        this.images = [];

        this.imageURLs = [
            "/img/tracker-imgs/bh.jpg",
            "/img/tracker-imgs/clock-rotate-left-solid.svg",
            "/img/tracker-imgs/eem.jpg",
            "/img/tracker-imgs/gw.jpeg",
            "/img/tracker-imgs/kr.jpg",
            "/img/tracker-imgs/mu.jpg",
            "/img/tracker-imgs/sam.jpg",
            "/img/tracker-imgs/sk.jpg",
            "/img/tracker-imgs/ss.jpg",
            "/img/tracker-imgs/st.jpg",
            "/img/newspaper.svg",
            "/img/dome-building.svg",
            "/img/afa-small.svg"
        ];

        var self = this;

        $.each(self.imageURLs, function(i, v){
            let newImage = new Image();
            newImage.src = v;
            self.images.push(newImage);

            if(newImage.complete){

                self.imageHasLoaded(self);
            }
            else{
                newImage.addEventListener('load', function(){self.imageHasLoaded(self)});
                newImage.addEventListener('error', function(){
                    self.imageHasLoaded(self);
                    console.log("Error loading image: " + newImage.src);
                });
            }

        });
    }

    imageHasLoaded(self){
        self.doneCount = self.doneCount + 1;
    }
}
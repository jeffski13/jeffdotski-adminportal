import React from 'react';
import { FormGroup, FormControl, ButtonToolbar, Button, Glyphicon } from 'react-bootstrap';

export default class ResizeImg extends React.Component {
    thumb = (event) => {
        let files = event.target.files;
        if (files == null || files == undefined) {
            document.write("This Browser has no support for HTML5 FileReader yet!");
            return false;
        }

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var imageType = /image.*/;
            if (!file.type.match(imageType)) {
                continue;
            }

            var reader = new FileReader();
            if (reader != null) {
                reader.onload = this.GetThumbnail;
                reader.readAsDataURL(file);
            }            
        }
    }
    
    GetThumbnail = (event) =>{
        var myCan = document.createElement('canvas');
        var img = new Image();
        img.src = event.target.result;
        img.onload = function () {
            
            myCan.id = "myTempCanvas";
            var fixHeight = 250;
            var ratioedWidth = Math.floor((this.width * fixHeight) / this.height);
            myCan.width = Number(ratioedWidth);
            myCan.height = Number(fixHeight);
            
            if (myCan.getContext) {
                var cntxt = myCan.getContext("2d");
                cntxt.drawImage(img, 0, 0, myCan.width, myCan.height);
                var dataURL = myCan.toDataURL();
                console.log('jeffski: data url', dataURL);

                //draw it on screen
                if (dataURL != null && dataURL != undefined) {
                    var nImg = document.createElement('img');
                    nImg.src = dataURL;
                    document.body.appendChild(nImg);
                }
                else{
                    alert('unable to get context');
                }
            }
        }
    }

    render() {
        return (
            <div>
                RESIZE IMAGE
                <FormGroup
                    controlId="imageSelectski"
                >
                    <FormControl
                        multiple
                        type="file"
                        placeholder="Choose File"
                        onChange={this.thumb}
                    />
                </FormGroup>
            </div>
        );
    }
}
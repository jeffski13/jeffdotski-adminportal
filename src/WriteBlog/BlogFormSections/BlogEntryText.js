import React from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { validateFormString, FORM_SUCCESS } from '../../formvalidation';

/*
normal paragraph text for the blog.
Can contain multiple paragraphs
*/
const BLOG_TEXT_ROWS_DEFAULT = 4;
class BlogEntryText extends React.Component {

    constructor(props, context) {
        super(props, context);
        
        this.state = {
          blogtext: '',
          blogTextRows: BLOG_TEXT_ROWS_DEFAULT
        };
    }

    handleBlogTextChange = (e) => {
        let textArr = this.blogTextArea.value.split(/\r*\n/);
        let rows = BLOG_TEXT_ROWS_DEFAULT;
        if(textArr.length >= BLOG_TEXT_ROWS_DEFAULT){
            rows = textArr.length;
        }
        this.setState({ 
            blogtext: this.blogTextArea.value,
            blogTextRows: rows
        }, () => {
            this.createBlogTextModel();
        });
    }

    createBlogTextModel = () => {
        //send up null if form is invalid
        if(validateFormString(this.state.blogtext) !== FORM_SUCCESS){
            this.props.formDataCallback(null);
            return;
        }

        //create string array. items are separated by carriage returns
        let blogArr = this.state.blogtext.split('\n');
        //filter out empty text (empty string will be present if user used multiple carriage returns)
        blogArr = blogArr.filter(str => str !== '');
        let blogTextArrModel = this.rawBlogToBlogTextModel(blogArr);

        this.props.formDataCallback(blogTextArrModel);
    }
    
    //returns an array of objects with a "text" field. 
    rawBlogToBlogTextModel(blogArr){
        let finalArr = [];
        blogArr.forEach(function(str) {
          let nextEntry = {
            text: str
          };
          finalArr.push(nextEntry);
        });
        return finalArr;
    }

    render(){
        return(
            <FormGroup 
                controlId="formControlsTextarea"
                validationState={validateFormString(this.state.blogtext)}
            >
                <ControlLabel>What Happened Today?</ControlLabel>
                <FormControl
                    componentClass="textarea" 
                    value={this.state.blogtext}
                    placeholder="blog text"
                    onChange={this.handleBlogTextChange}
                    inputRef={ref => { this.blogTextArea = ref; }}
                    rows={this.state.blogTextRows}
                    />
            </FormGroup>
        );
    }
}

BlogEntryText.propTypes = {
    formDataCallback: PropTypes.func //will be called with null if form data is invalid
}

export default BlogEntryText;
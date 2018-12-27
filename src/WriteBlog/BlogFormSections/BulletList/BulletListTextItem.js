import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { Glyphicon } from 'react-bootstrap';

import { validateFormString } from '../../../formvalidation';
import './styles.css';

/*
the individual bullet item (for the BulletList)
*/
class BulletListTextItem extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            title: undefined,
            text: undefined,
            subtext: undefined,
            isDeletHovered: false
        };
    }

    handleTitleChange = (e) => {
        if (e.target.value === '') {
            this.setState({ title: undefined });
        }
        else {
            this.setState({ title: e.target.value });
        }
    }

    handleTextChange = (e) => {
        if (e.target.value === '') {
            this.setState({ text: undefined });
        }
        else {
            this.setState({ text: e.target.value });
        }
    }

    handleSubtextChange = (e) => {
        if (e.target.value === '') {
            this.setState({ subtext: undefined });
        }
        else {
            this.setState({ subtext: e.target.value });
        }
    }

    onDeleteBulletButtonClicked = () => {
        this.props.onDeleteBulletCallback();
    }

    setBulletPendingDelete = () => {
        this.setState({ isDeletHovered: true });
    }

    setBulletNOTPendingDelete = () => {
        this.setState({ isDeletHovered: false });
    }

    //get current information in this component and that info back to callback
    returnBlogBulletListModelData = () => {
        //if title, text, and subtext are all null, form is invalid
        if (!this.state.title && !this.state.text && !this.state.subtext) {
            this.props.onDataUpdatedCallback(null);
            return;
        }

        let blogListTextItemModel = {
            title: this.state.title,
            text: this.state.text,
            subtext: this.state.subtext
        }
        this.props.onDataUpdatedCallback(blogListTextItemModel);
    }

    //true if any field has a value
    isAnyFieldFilled = () => {
        return (this.state.title || this.state.text || this.state.subtext);
    }

    render() {

        // when user hovers over delete button, light up area to be deleted
        let hoverClass = '';
        if(this.state.isDeletHovered){
            hoverClass = 'BulletListItem_toBeDeleted'
        }
        return (
            <form className="bulletListItem" >
                <Col xs={2} sm={1} mdHidden lgHidden className={`BulletListItem-deleteButtonContainer ${hoverClass}`} >
                    <Button
                        onClick={this.onDeleteBulletButtonClicked}
                        bsStyle="danger" bsSize="xs"
                        onMouseEnter={this.setBulletPendingDelete} onMouseLeave={this.setBulletNOTPendingDelete}
                        onFocus={this.setBulletPendingDelete} onBlur={this.setBulletNOTPendingDelete}
                    >
                        <Glyphicon glyph="remove" />
                    </Button>
                </Col>
                <Col xs={10} sm={11} md={4} lg={4} className={hoverClass} >
                    <FormGroup
                        validationState={this.isAnyFieldFilled() ? null : validateFormString(this.state.title)}
                        className="formTitleInput"
                    >
                        <label className="has-float-label">
                            <FormControl
                                type="text"
                                value={this.state.title}
                                onChange={this.handleTitleChange}
                                onBlur={this.returnBlogBulletListModelData}
                                name="title"
                                className="form-label-group ability-input"
                                placeholder="put title text here..."
                            />
                            <span>Title</span>
                        </label>
                    </FormGroup>
                </Col>
                <Col xs={12} sm={12} md={7} lg={7} className={hoverClass} >
                    <FormGroup
                        controlId="formTextInput"
                        validationState={this.isAnyFieldFilled() ? null : validateFormString(this.state.text)}
                    >
                        <label className="has-float-label">
                            <FormControl
                                type="text"
                                value={this.state.text}
                                placeholder="Enter text"
                                onChange={this.handleTextChange}
                                onBlur={this.returnBlogBulletListModelData}
                                name="text"
                                className="form-label-group ability-input BulletTextItem_formTextInput"
                            />
                            <span>Text</span>
                        </label>
                    </FormGroup>
                </Col>
                <Col smHidden xsHidden md={1} className={`BulletListItem-deleteButtonContainer ${hoverClass}`} >
                    <Button
                        onClick={this.onDeleteBulletButtonClicked}
                        bsStyle="danger" bsSize="xs"
                        onMouseEnter={this.setBulletPendingDelete} onMouseLeave={this.setBulletNOTPendingDelete}
                        onFocus={this.setBulletPendingDelete} onBlur={this.setBulletNOTPendingDelete}
                    >
                        <Glyphicon glyph="remove" />
                    </Button>
                </Col>
                <Col xs={12} className={hoverClass} >
                    <FormGroup
                        controlId="formSubtextInput"
                        validationState={this.isAnyFieldFilled() ? null : validateFormString(this.state.subtext)}
                    >
                        <label className="has-float-label">
                            <FormControl
                                type="text"
                                value={this.state.subtexttitle}
                                placeholder="Enter subtext"
                                onChange={this.handleSubtextChange}
                                onBlur={this.returnBlogBulletListModelData}
                                name="subtext"
                                componentClass="textarea"
                                className="form-label-group ability-input BulletTextItem_formSubtextInput"
                            />
                            <span>More Details</span>
                        </label>
                    </FormGroup>
                </Col>
            </form>
        );
    }
}

BulletListTextItem.propTypes = {
    onDataUpdatedCallback: PropTypes.func //called with null as first param if this form is invalid
}

export default BulletListTextItem;
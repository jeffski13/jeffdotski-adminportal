import React, { Component } from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

import './styles.css';

class BlogTextItem extends Component {

  constructor(props) {
    super(props);

    this.renderText = this.renderText.bind(this);
    this.renderList = this.renderList.bind(this);
  }

  renderText() {
    if (this.props.blogTextData.text) {
      return (
        <Col sm={8} >{this.props.blogTextData.text}</Col>
      );
    }
    else {
      return null;
    }
  }

  renderList() {

    if (this.props.blogTextData.list) {

      if (this.props.blogTextData.list.style === "number") {
        return (
          <Col sm={8} >
            <ol>{this.props.blogTextData.list.textItems.map(this.renderBulletListItem)}</ol>
          </Col>
        );
      }
      else if (this.props.blogTextData.list.style === "bullet") {
        return (
          <Col sm={8} >
            <ul>{this.props.blogTextData.list.textItems.map(this.renderBulletListItem)}</ul>
          </Col>
        );
      }
      else if (this.props.blogTextData.list.style === "quote") {
        return (
          <div>
            <Col sm={5} smOffset={1} >
              <em>"{this.props.blogTextData.list.textItems[0].text}"</em>
            </Col>
            { this.props.blogTextData.list.textItems[0].subtext && <Col sm={8} smOffset={2} >
              ~{this.props.blogTextData.list.textItems[0].subtext}
            </Col>}
          </div>
        );
      }
    }
    else {
      return null;
    }
  }

  //render the rest of the bullet items
  renderBulletListItem(bulletListItem, index) {
    let title = null;
    if (bulletListItem.title) {
      let titleText = bulletListItem.title.trim();
      title = (
        <strong>{titleText}: </strong>
      )
    }

    let subText = null;
    if (bulletListItem.subtext) {
      subText = (
        <div>{bulletListItem.subtext}</div>
      );
    }

    //add in subtext. bold title, add in text
    return (
      <li key={index}>
        {title}{bulletListItem.text}
        {subText}
      </li>
    );
  }

  render() {
    return (
      <Row className="show-grid blogPargraph">
        {this.renderText()}
        {this.renderList()}
      </Row>
    );
  }
}

export default BlogTextItem;

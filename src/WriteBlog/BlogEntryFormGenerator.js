import React from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';

import BlogFormSections from './BlogFormSections';
import BlogEntryText from './BlogFormSections/BlogEntryText';
import BulletList from './BlogFormSections/BulletList';
import Quote from './BlogFormSections/Quote';
import './styles.css';
import uuidv1 from 'uuid/v1';

/* 
toolbox for creating a blog.
user can click buttons corresponding to different blog things they want.
these blog elements will appear as they click them buttons.
*/
export default class BlogEntryFormGenerator extends React.Component {

    static propTypes = {
        //callback with data parameter which will execute when blog data has been obtained
        getBlogTextData: PropTypes.func,
        //refresh counter: could be anything just needs to change to refresh
        refreshProp: PropTypes.any
    };

    constructor(props) {
        super(props);

        this.createBlogDataModel = this.createBlogDataModel.bind(this);

        this.state = {
            //toolbox with all components that can be used to make blog content.
            blogSectionsToolbox: [
                {
                    label: 'Blog Paragraphs',
                    component: BlogEntryText,
                    blogData: null,
                    id: null
                },
                {
                    label: 'Bullet List',
                    component: BulletList,
                    blogData: null,
                    id: null
                },
                {
                    label: 'Quote',
                    component: Quote,
                    blogData: null,
                    id: null
                }
            ],
            //sections generated by user for blog creation. This array reflects the blog elements on screen.
            blogSectionsOnscreen: [
                {
                    label: 'Blog Paragraphs',
                    component: BlogEntryText,
                    blogData: null,
                    id: uuidv1()
                }
            ]
        }
    }

    componentDidUpdate(prevProps) {
        //wipe out our data on refresh update
        if (this.props.refreshProp !== prevProps.refreshProp) {
            this.setState({
                blogSectionsOnscreen: [{
                    label: 'Blog Paragraphs',
                    component: BlogEntryText,
                    blogData: null,
                    id: uuidv1()
                }]
            });
        }
    }

    //callback for when form section is deleted
    sectionDeletedCallback = (idx) => {

        let filteredBlogEntrySectionArr = [];
        this.state.blogSectionsOnscreen.map((section, index) => {
            if (index !== idx) {
                filteredBlogEntrySectionArr.push(section);
            }
        })

        this.setState({ blogSectionsOnscreen: [...filteredBlogEntrySectionArr] },
            () => {
                //hand combined state up to parent object
                let blogtextdata = this.createBlogDataModel();
                this.props.getBlogTextData(blogtextdata);
            }
        );

    }

    //callback for when child form is filled out
    storeSectionDataCallback = (idx, newBlogData) => {
        //set state for this object
        let sectionsArrWithData = [...this.state.blogSectionsOnscreen];
        sectionsArrWithData[idx].blogData = newBlogData;
        this.setState({ blogSectionsOnscreen: sectionsArrWithData },
            () => {
                //hand combined state up to parent object
                let blogtextdata = this.createBlogDataModel();
                this.props.getBlogTextData(blogtextdata);
            }
        );
    }

    //returns a model with blog text data ready to be pushed to the server
    createBlogDataModel() {
        let blogTextData = [];
        this.state.blogSectionsOnscreen.forEach((nextBlogSection) => {
            if (nextBlogSection.blogData !== null) { //check here to see if blogData is null (could be empty data handed back)
                if (Array.isArray(nextBlogSection.blogData)) {
                    blogTextData = [...blogTextData, ...nextBlogSection.blogData];
                }
                else {
                    blogTextData = [...blogTextData, nextBlogSection.blogData];
                }
            }
        });

        return blogTextData;
    }

    //renders a blog section. These sections were chosen by the user
    renderBlogSection = (sectionComponentInfo, index) => {
        //get title and component information
        let SectionComponent = sectionComponentInfo.component;
        return (
            <BlogFormSections
                key={sectionComponentInfo.id}
                sectionOnScreen={index}
                title={sectionComponentInfo.label}
                deleteCallback={() => { this.sectionDeletedCallback(index) }}
            >
                <SectionComponent
                    sectionOnScreen={index}
                    formDataCallback={(data) => {
                        //NOTE to implementing components: 
                        //formDataCallback can/should be called with data parameter as null if form data is invalid
                        this.storeSectionDataCallback(index, data)
                    }}
                />
            </BlogFormSections>
        );
    }

    //renders the button for the blog toolbox. These buttons when clicked will allow the user to add different blog sections
    createBlogToolboxButton = (buttonInfo, index) => {
        
        return (
            <Button
                key={index}
                className='BlogEntryFormGenerator_addButton'
                onClick={() => this.onAddBlogSectionButtonClicked(index)}
            >
                {buttonInfo.label}
            </Button>
        )
    }

    // adds a new blog section from the toolbox. The selection from the toolbox will eventually appear on screen.
    onAddBlogSectionButtonClicked = (index) => {
        //make a copy (NOT a reference) and put the new toolbox in the state array of all the forms on the page
        let nextBlogSection = { ...this.state.blogSectionsToolbox[index] };
        //add a unique id. the id will be the key when placed on screen
        nextBlogSection.id = this.state.blogSectionsToolbox[index].label + (new Date()).getTime();
        this.setState({ blogSectionsOnscreen: [...this.state.blogSectionsOnscreen, nextBlogSection] });
    }

    //the user can add fields of different types
    render() {
        return (
            <div>
                {this.state.blogSectionsOnscreen.map(this.renderBlogSection)}
                <div className="addSectionButtonsContainer">
                    <strong>Add More: </strong>{this.state.blogSectionsToolbox.map(this.createBlogToolboxButton)}
                </div>
            </div>
        );
    }
}
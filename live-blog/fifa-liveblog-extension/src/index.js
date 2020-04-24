import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import {
  DisplayText,
  Paragraph,
  SectionHeading,
  TextInput,
  Textarea,
  FieldGroup,
  RadioButtonField,
  Form,
  Button,
  Icon
} from '@contentful/forma-36-react-components';
import { init, locations } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';

export class App extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      body: "",
      socialMediaLink: "",
      embeddedItems: [],
      lifeBlogId: this.props.sdk.parameters.invocation.path.substring(1),
      matchId: null,
      images: [],
      isPublishing: false
    };
  }

  generatePreview(item) {
    if (item.resource_type == "image") {
      return (<div style={{"width": "200px"}}>
        <img src={item.secure_url}></img>
      </div>)
    }
  }

  onBodyChangeHandler = event => {
    const value = event.target.value;
    this.setState({ body: value });
  };

  onSocialMediaChangeHandler = event => {
    const value = event.target.value;
    this.setState({ socialMediaLink: value });
  };

  createRichTextData(value) {
    let data = {
      fields: {
        body: {
          "en-US": {
            nodeType:'document', 
            data: {},
            content: [
              {
                nodeType: 'paragraph',
                data: {},
                content: [
                  {
                    nodeType: 'text',
                    data: {},
                    marks: [],
                    value: value
                  }
                ]
              }
            ]
          }
        }
      }
    }
    return data;
  }

  componentDidMount() {
    this.setMatchId();
    this.getAllImages();
  }

  setMatchId() {
    let { sdk } = this.props; 
    sdk.space.getEntries({
      'content_type': 'matchPage',
      'fields.liveBlog.sys.id': this.state.lifeBlogId
    }).then(r => {
      if (r.items && r.items[0] && r.items[0].fields.matchId && r.items[0].fields.matchId['en-US']) {
        this.setState({matchId: r.items[0].fields.matchId['en-US']})
      }
    })
  }

  getAllImages() {
    let { sdk } = this.props; 
    sdk.space.getEntries({
      'content_type': 'image',
    }).then(r => {
      if (r.items) {
        this.setState({images: r.items})
      }
    })
  }

  onPublish = () => {
    let { sdk } = this.props; 
    let data = this.createRichTextData(this.state.body);
    this.setState({body: ""});
    sdk.space.createEntry('liveBlogPost', data).then((newPost) => {
      sdk.space.publishEntry(newPost).then(() => {
        sdk.space.getEntry(this.state.lifeBlogId).then((lifeBlog) => {
          let posts = lifeBlog.fields.posts;
          if (!posts) {
            posts = {"en-US": []}
          }
          posts["en-US"].push({sys: {id: newPost.sys.id, linkType: 'Entry', type: "Link"}})
          lifeBlog.fields.posts = posts;
          sdk.space.updateEntry(lifeBlog).then(updated => {
            sdk.space.publishEntry(updated)
          })
        })
      })
    })
    
  }

  render() {
    
    const { embeddedItems, matchId } = this.state;

    let serverAddress = (this.props.sdk.parameters && this.props.sdk.parameters.installation && this.props.sdk.parameters.installation.server) || 'https://fifasite.netlify.app'

    return (
    <div style={{"display":"flex"}}>
      <div style={{"flex": "0 0 20%", "padding":"0 0 0 50px"}}>
        <div style={{textAlign: "center", padding: "10px 0", backgroundColor:"#326295"}}>
          <DisplayText style={{color: "white"}}>Timeline
        </DisplayText></div>
       <iframe src={matchId ? `${serverAddress}/matches/${matchId}#feed` : ""} width="800" height="5000" style={{borderWidth:0}}/>
      </div>
      <div style={{"flex": "0 0 40%", "margin":"0 10px"}}>
      <div style={{textAlign: "center", padding: "10px 0",backgroundColor:"#326295"}}>
          <DisplayText style={{color: "white"}}>Publisher
        </DisplayText></div>
<Form className="f36-margin--l">
        <Textarea testId="field-body" rows="10" onChange={this.onBodyChangeHandler} value={this.state.body} />
        <SectionHeading>Social Media Link</SectionHeading>
        <TextInput
          testId="field-title"
          onChange={this.onSocialMediaChangeHandler}
          value={this.state.socialMediaLink}
        />
        <Button size="large" isFullWidth="true" onClick={this.onPublish}>Publish</Button>
      </Form>
      </div>
      <div style={{"flex": "0 0 20%"}}>
      <div style={{textAlign: "center", padding: "10px 0", backgroundColor:"#326295"}}>
          <DisplayText style={{color: "white"}}>Content browser
        </DisplayText></div>
      <div className="container">
        <img src="https://res.cloudinary.com/netcompany/image/upload/v1587678433/live-blog-extension/content-cards_vh4ism.gif" />
      </div>
      </div>
    </div>
      
    );
  }
}


export function SidebarExtension(props) {
  useEffect(() => {
    return props.sdk.window.startAutoResizer();
  }, [props.sdk]);

  return (
    <Button
      testId="open-page-extension"
      onClick={() => {
        props.sdk.navigator.openPageExtension({ path: `/${props.sdk.entry.getSys().id}` });
      }}>
      Live Blog Editor
    </Button>
  );
}

SidebarExtension.propTypes = {
  sdk: PropTypes.object.isRequired
};

init(sdk => {
 
  if (sdk.location.is(locations.LOCATION_PAGE)) {
    render(<App sdk={sdk} />, document.getElementById('root'));
  } else if (sdk.location.is(locations.LOCATION_ENTRY_SIDEBAR)) {
    render(<SidebarExtension sdk={sdk} />, document.getElementById('root'));
  } else if (sdk.location.is(locations.LOCATION_ENTRY_EDITOR)) {
    render(<App sdk={sdk} />, document.getElementById('root'));
  } else {
    return null;
  }
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }

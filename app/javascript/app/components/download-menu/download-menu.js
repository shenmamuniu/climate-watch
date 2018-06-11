import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { createElement, PureComponent } from 'react';
import { actions } from 'components/modal-download';

import Component from './download-menu-component';

const { S3_BUCKET_NAME } = process.env;

const server = `http://${S3_BUCKET_NAME}.s3.amazonaws.com`;
const folder = '/climate-watch-download-zip';
const url = `${server}${folder}`;

// The NDC quantification and pathway files should not be made public
// before the functionality and data are available on production site
// {
//   label: 'NDC quantification (367 kB)',
//   link: `${url}/ndc-quantification.zip`,
//   target: '_self'
// }

const mapStateToProps = ({ modalDownload }) => ({
  isOpen: modalDownload.isOpen
});

class DownloadMenuContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      opened: false
    };
  }

  handleOnClick = downloadUrl => {
    this.props.setModalDownloadParams({
      open: true,
      downloadUrl
    });
  };

  render() {
    return createElement(Component, {
      ...this.props,
      downloadMenuOptions: [
        {
          label: 'All data (62 MB)',
          link: `${url}/all.zip`,
          target: '_self'
        },
        {
          label: 'NDC Content (6.4 MB)',
          link: `${url}/ndc-content.zip`,
          target: '_self'
        },
        {
          label: 'NDC Targets (329 KB)',
          link: `${url}/NDC_quantification.zip`,
          target: '_self'
        },
        {
          label: 'NDC Text in HTML (53 MB)',
          link: `${url}/NDC_text_HTML.zip`,
          target: '_self'
        },
        {
          label: 'GHG emissions (3.5 MB)',
          link: `${url}/ghg-emissions.zip`,
          target: '_self'
        },
        {
          label: 'Adaptation (357 kB)',
          link: `${url}/adaptation.zip`,
          target: '_self'
        },
        {
          label: 'Socioeconomic (450 kB)',
          link: `${url}/socioeconomic-indicators.zip`,
          target: '_self'
        },
        {
          label: 'Pathways (2.1 MB)',
          action: this.handleOnClick.bind(this, `${url}/pathways.zip`)
        }
      ]
    });
  }
}

DownloadMenuContainer.propTypes = {
  setModalDownloadParams: PropTypes.func.isRequired
};

export default connect(mapStateToProps, actions)(DownloadMenuContainer);

import { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import reducers, { initialState } from './data-explorer-provider-reducers';
import * as actions from './data-explorer-provider-actions';

class DataExplorerProvider extends PureComponent {
  componentDidMount() {
    const { fetchSectionMetadata, fetchMetadata, section } = this.props;
    fetchSectionMetadata();
    fetchMetadata(section);
  }

  componentDidUpdate(prevProps) {
    const { fetchDataExplorer, section, query, page, initialized } = this.props;
    const {
      section: prevSection,
      query: prevQuery,
      page: prevPage,
      initialized: prevInitialized
    } = prevProps;
    if (
      page !== prevPage ||
      section !== prevSection ||
      query !== prevQuery ||
      initialized !== prevInitialized
    ) {
      fetchDataExplorer({ section, query, page });
    }
  }

  render() {
    return null;
  }
}

DataExplorerProvider.propTypes = {
  fetchDataExplorer: PropTypes.func.isRequired,
  fetchSectionMetadata: PropTypes.func.isRequired,
  fetchMetadata: PropTypes.func.isRequired,
  query: PropTypes.string,
  section: PropTypes.string,
  page: PropTypes.string,
  initialized: PropTypes.bool.isRequired
};

DataExplorerProvider.defaultProps = {
  initialized: false
};

export { actions, reducers, initialState };

export default connect(null, actions)(DataExplorerProvider);

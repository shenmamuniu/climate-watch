import React, { PureComponent } from 'react';
import Proptypes from 'prop-types';
import cx from 'classnames';

import Dropdown from 'components/dropdown';
import Icon from 'components/icon';

import searchIcon from 'assets/icons/search.svg';
import theme from 'styles/themes/dropdown/dropdown-links.scss';
import styles from './autocomplete-search-styles.scss';

class AutocompleteSearch extends PureComponent {
  render() {
    const {
      handleValueClick,
      handleSearchChange,
      searchList,
      className,
      placeholder
    } = this.props;
    return (
      <div className={cx(styles.wrapper, className)}>
        <Dropdown
          className={theme.dropdownOptionWithArrow}
          placeholder={placeholder}
          options={searchList}
          onSearchChange={handleSearchChange}
          onValueChange={handleValueClick}
          value={null}
          hideResetButton
          white
          hasSearch
          renderToggleButton={({ open }) => (
            <Icon
              icon={searchIcon}
              className={cx(styles.searchIcon, !open ? styles.whiteIcon : '')}
            />
          )}
        />
      </div>
    );
  }
}

AutocompleteSearch.propTypes = {
  handleValueClick: Proptypes.func.isRequired,
  handleSearchChange: Proptypes.func.isRequired,
  searchList: Proptypes.array,
  placeholder: Proptypes.string,
  className: Proptypes.string
};

AutocompleteSearch.defaultProps = {
  placeholder: 'Search for a country or keyword',
  className: null
};

export default AutocompleteSearch;

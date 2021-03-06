import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import CarouselSectionComponent from './carousel-section-component';
import { getCountriesOptions, getCountryLocationData } from '../home-selectors';

const mapStateToProps = state => ({
  countriesOptions: getCountriesOptions(state.countries),
  geolocation: getCountryLocationData(state.geoLocation)
});

export default withRouter(
  connect(mapStateToProps, null)(CarouselSectionComponent)
);

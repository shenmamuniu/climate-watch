export const initialState = {
  loading: false,
  loaded: false,
  data: [],
  error: false
};

const setLoading = (loading, state) => ({ ...state, loading });
const setLoaded = (loaded, state) => ({ ...state, loaded });
const setError = (state, error) => ({ ...state, error });

export default {
  fetchAgricultureEmissionsInit: state => setLoading(true, state),
  fetchAgricultureEmissionsReady: (state, { payload: { data } }) =>
    setLoaded(true, setLoading(false, { ...state, data })),
  fetchAgricultureEmissionsFail: state =>
    setLoading(setError(state, true), false)
};

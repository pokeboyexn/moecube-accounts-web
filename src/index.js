import { message } from 'antd';
import dva from 'dva';
import createLoading from 'dva-loading';
import { browserHistory } from 'dva/router';
import ReactDOM from 'react-dom';
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';
import zh from 'react-intl/locale-data/zh';
import localeData from '../i18n.json';
import './index.less';

// 1. Initialize
const app = dva({
  onError: (error) => {
    message.destroy();
    message.error(error.message);
  },
  history: browserHistory,
});

app.use(createLoading());


app.model(require('./models/user'));

app.model(require('./models/upload'));

app.model(require('./models/auth'));

// app.model(require('./models/haha'));

// app.model(require("./models/login"));

app.model(require('./models/common'));


// 2. Plugins
// app.use({});

// 3. Model
// app.model(require('./models/example'));

// 4. Router
app.router(require('./router'));

// 5. Start


addLocaleData([...en, ...zh]);

const languageY = localStorage.getItem('locale') || navigator.language || (navigator.languages && navigator.languages[0]) || navigator.userLanguage;

const anguageWithoutRegionCode = languageY.toLowerCase().split(/[_-]+/)[0];
const language = anguageWithoutRegionCode === 'zh' ? 'zh-CN' : 'en-US';
const messages = localeData[language];

const App = app.start();
ReactDOM.render(
  <IntlProvider locale={language} messages={messages}>
    <App/>
  </IntlProvider>,
  document.getElementById('root'),
);


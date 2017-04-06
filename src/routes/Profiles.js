import { Button, Form, Icon, Input, Spin, Tabs } from 'antd';
import 'cropperjs/dist/cropper.css';
import { connect } from 'dva';
import React, { PropTypes } from 'react';
import Cropper from 'react-cropper';
import { FormattedMessage as Format } from 'react-intl';
import EmailForm from '../components/EmailForm';
import PasswordForm from '../components/PasswordForm';
import UserNameForm from '../components/UserNameForm';
import styles from './Profiles.less';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

const defaultAvatar = require('../../public/default_avatar.jpg');

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 15 },
};

// function getBase64(img, callback) {
//   const reader = new FileReader();
//   reader.addEventListener('load', () => callback(reader.result));
//   reader.readAsDataURL(img);
// }

class Profiles extends React.Component {

  static contextTypes = {
    intl: PropTypes.object.isRequired,
  };

  onUpdateSubmit = (e) => {
    const { form, dispatch, user: { id } } = this.props;

    if (e) {
      e.preventDefault();
    }
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);

        const { username, name, password } = values;

        dispatch({ type: 'user/updateProfile', payload: { username, name, password, user_id: id } });
      }
    });
  };

  onGetFile = (e) => {
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.props.dispatch({ type: 'upload/getfile', payload: { imageUrl: reader.result } });
    };
    reader.readAsDataURL(files[0]);
  };

  handleUpload = () => {
    if (typeof this.cropper.getCroppedCanvas() === 'undefined') {
      return;
    }
    const { user: { id } } = this.props;

    this.cropper.getCroppedCanvas().toBlob((blob) => {
      console.log(blob);
      this.props.dispatch({ type: 'upload/upload', payload: { image: blob, user_id: id } });
    });
  };

  render() {
    const { dispatch, form, user, loading, imageUrl, isUpload } = this.props;
    const { getFieldDecorator } = form;
    const { name, avatar } = user;
    const { intl: { messages } } = this.context;

    const nameProps = {
      fromItem: {
        label: messages.nickname,
        ...formItemLayout,
      },
      decorator: {
        initialValue: name,
      },
      input: {
        placeholder: messages.nickname,
      },
    };

    /* eslint-disable jsx-a11y/label-has-for */
    return (
      <Spin spinning={loading} delay={100}>
        <Tabs defaultActiveKey="1" className="app-detail-nav">
          <TabPane tab={<span><Icon type="user"/><Format id={'user-info'}/> </span>} key="1">
            <Form onSubmit={this.onUpdateSubmit}>

              <FormItem style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: isUpload ? 'flex' : 'none', flexDirection: 'column' }}>
                  <Cropper
                    ref={(cropper) => {
                      this.cropper = cropper;
                    }}
                    src={imageUrl || defaultAvatar}
                    style={{ height: '20vw', width: '20vw' }}
                    aspectRatio={1 / 1}
                    guides
                  />
                  <Button type="primary" onClick={this.handleUpload}>
                    <Icon type="upload"/> upload
                  </Button>
                </div>

                <div style={{ display: !isUpload ? 'flex' : 'none', flexDirection: 'column' }}>
                  <img alt="avatar" src={avatar || imageUrl || defaultAvatar}/>
                  <Button onClick={() => { dispatch({ type: 'upload/start' }); }}>
                    <label>
                      <Icon type="plus"/> Change Avatar
                      <input
                        type="file" onChange={this.onGetFile} ref={(file) => {
                          this.file = file;
                        }} style={{ display: 'none' }}
                      />
                    </label>
                  </Button>
                </div>
              </FormItem>

              <FormItem {...nameProps.fromItem}>
                {getFieldDecorator('name', { ...nameProps.decorator })(
                  <Input {...nameProps.input} />,
                )}
              </FormItem>

              <FormItem>
                <div className={styles.wrapSubmit}>
                  <Button type="primary" htmlType="submit" size="large"><Format id={'save'}/></Button>
                </div>
              </FormItem>
            </Form>
          </TabPane>

          <TabPane tab={<span><Icon type="setting"/><Format id={'account-info'}/></span>} key="2">

            <Tabs type="card" className="app-detail-nav">
              <TabPane tab={messages['reset-username']} key={0}>
                <UserNameForm />
              </TabPane>

              <TabPane tab={messages['reset-email']} key={1}>
                <EmailForm />
              </TabPane>

              <TabPane tab={messages['reset-password']} key={2}>
                <PasswordForm />
              </TabPane>
            </Tabs>

          </TabPane>
        </Tabs>
      </Spin>
    );
  }
}

function mapStateToProps(state) {
  const {
    user: { user, isUpdateSubmit },
    auth: { checkUsername, isEmailExists, isUserNameExists },
    upload: { imageUrl, isUpload, uploadedImage },
  } = state;

  const loading = state.loading.global || false;

  return {
    user,
    loading,
    imageUrl,
    isUpload,
    checkUsername,
    uploadedImage,
    isEmailExists,
    isUserNameExists,
    isUpdateSubmit,
  };
}

const WrapperProfiles = Form.create()(Profiles);

export default connect(mapStateToProps)(WrapperProfiles);

//简答题
import React, { Component } from "react";
import { List, TextareaItem, ImagePicker, Progress } from "antd-mobile";
import { Upload, Modal, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { createForm } from "rc-form";
import ImgUpload from "../../ImgUpload/index";
import JiandaAnalysis from "../JiandaAnalysis/index";
import "./style.less";
const addpicture = require("@/statics/img/addpictures@2x.png");
const timerImg = require("@/statics/img/timerImg@2x.png");
const video = require("@/statics/img/video.png");
import QuestionAnalysis from "../QuestionAnalysis/index";
import QuestionVIdeo from "../../Video/QuestionVideo";
import Zmage from "react-zmage";
import { getImageLoad, getVideoProgressLoad } from "@/fetch/api/subject";
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
class AnswerQuestions extends Component {
  constructor(props, context) {
    super(props, context),
      (this.state = {
        answers: [
          {
            // 答案数据
            content: "",
            imageList: [],
            videoList: [],
          },
        ],
        previewImgFlg: false, // 图片预览弹层开关
        previewImage: "", // 图片预览弹层图片
        previewTitle: "", // 图片预览弹层图片名
        imgFileName: "", // 图片名
        imgFile: {}, // 图片数据
        videoFileName: "", // 视频名
        videoFile: {}, // 视频数据
        videoFileList: [], // 初始视频
        fileList: [],
        analysisData: {},
        textareaValue: "",
        imageList: [],
        imgFileList: [],
        videoFileList: [],
        progressImg: 0,
        progressVideo: 0,
      });
  }
  //设置textareaValue
  handleTextareaChange = (e) => {
    var answers = this.state.answers;
    answers[0].content = e;
    this.setState({
      textareaValue: e,
    });
    this.props.imageAnswers(answers);
  };
  //进度条改变的时候
  uploadProgressChange = (e, type) => {
    const progress = parseInt((e.loaded / e.total) * 100);
    if (type === "img") {
      this.setState({
        progressImg: progress,
      });
    } else if (type === "video") {
      this.setState({
        progressVideo: progress,
      });
    }
  };
  getUpload(file, upType) {
    // 上传
    var fromData = new FormData();
    fromData.append("file", file);
    fromData.append("type", 1);
    getVideoProgressLoad(fromData, this.uploadProgressChange, upType).then(
      (result) => {
        if (result.code == 200) {
          if (upType == "img") {
            this.setState({
              progressImg: 0,
            });
            var answers = this.state.answers;
            answers[0].imageList[0] = result.data.path;
            //将图片路径传给父组件
            this.props.imageAnswers(answers);
          } else if (upType == "video") {
            var answers = this.state.answers;
            answers[0].videoList[0] = result.data.path;
            var videoFileList = [];
            videoFileList.push({
              uid: "-2",
              name: "video",
              status: "done",
              url: result.data.imgUrl,
            });
            this.setState({
              videoFileList,
              progressVideo: 0,
            });
            this.props.imageAnswers(answers);
          }
        } else {
          this.setState({ spinningFlg: false, subjectDetailShowFlg: true });
          // message.error(result.msg);
        }
      }
    );
  }
  changeAnswer(event) {
    // 改变答案
    var answers = this.state.answers;
    answers[0].content = event.target.value;
    this.setState({ textareaValue: e.target.value, answers });
    this.props.imageAnswers(answers);
  }

  handleCancel = () => this.setState({ previewImgFlg: false }); // 关闭弹层

  handlePreview = async (file) => {
    // 弹层打开
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewImgFlg: true,
      previewTitle:
        file.name || file.url.substring(file.url.lastIndexOf("/") + 1),
    });
  };
  imgHandleChange(file) {
    // 图片改变
    if (file.fileList.length) {
      console.log(file, file.fileList.length);
      this.setState({
        imgFileName: file.file.name,
        imgFile: file.file,
        imgFileList: file.fileList,
      });
      this.getUpload(file.file, "img");
    } else {
      this.setState({
        imgFileName: "",
        imgFile: {},
        imgFileList: file.fileList,
      });
      var answers = this.state.answers;
      answers[0].imageList = [];
      // this.props.imagesQuestion()
      this.props.imageAnswers(answers);
    }
    return false;
  }
  videoHandleChange(file) {
    // 视频改变
    console.log(file);
    if (file.fileList.length) {
      this.setState({
        videoFileName: file.file.name,
        videoFile: file.file,
      });
      this.getUpload(file.file, "video");
    } else {
      this.setState({
        videoFileName: "",
        videoFile: {},
        videoFileList: file.fileList,
      });
      var answers = this.state.answers;
      answers[0].videoList = [];
      this.props.imageAnswers(answers);
    }
    return false;
  }
  beforeUpload(file, fileList) {
    // 阻断上传
    const isLt2M = file.size / 1024 / 1024 < 10;
    if (!isLt2M) {
      message.error("Image must smaller than 10MB!");
    }
    // return  isLt2M;
    return !isLt2M;
  }
  beforeUploads(file, fileList) {
    // 阻断上传
    const isLt2Ms = file.size / 1024 / 1024 < 100;
    if (!isLt2Ms) {
      message.error("Video must smaller than 100MB!");
    }
    return !isLt2Ms;
    // return false;
  }
  componentWillMount() {
    if (this.props.datas.userAnswer) {
      var imgFileList = [];
      var videoFileList = [];
      var answers = this.state.answers;
      var imgUrl = this.props.datas.userAnswer[0].imageList[0];
      if (imgUrl) {
        answers[0].imageList[0] = imgUrl.replace(
          "https://sistatic.etsafe.cn/",
          ""
        );
        imgFileList.push({
          uid: "-1",
          name: "image.png",
          status: "done",
          url: this.props.datas.userAnswer[0].imageList[0],
        });
      }
      var videoUrl = this.props.datas.userAnswer[0].videoList[0];
      if (videoUrl) {
        answers[0].videoList[0] = videoUrl.replace(
          "https://sistatic.etsafe.cn/",
          ""
        );
        videoFileList.push({
          uid: "-2",
          name: "video",
          status: "done",
          url: this.props.datas.userAnswer[0].videoList[0],
        });
      }
      this.setState({
        textareaValue: this.props.datas.userAnswer[0].content,
        imgFileList,
        videoFileList,
        imgFileName: this.props.datas.userAnswer[0].imageList[0],
        videoFileName: this.props.datas.userAnswer[0].videoList[0],
      });
    }
  }

  delVideo() {
    // 删除video
    this.setState({
      videoFileName: "",
      videoFile: {},
      videoFileList: [],
    });
    var answers = this.state.answers;
    answers[0].videoList = [];
    this.props.imageAnswers(answers);
  }

  render() {
    const { datas, analysisFlag, currentTopicNum, showTopicNum } = this.props;
    const uploadButton = (
      <div>
        <img src={addpicture} />
        <div>上传图片</div>
      </div>
    );
    const uploadVideoButton = (
      <div>
        <img src={addpicture} />
        <div>上传视频</div>
      </div>
    );
    let topicName = "简答题";
    return (
      <div className="answerwes-question">
        <div className="answerwea-questionsw">
          <div
            className={`first_title ${
              analysisFlag && datas.qualifiedScore ? "analysisTitle" : ""
            }`}
          >
            {analysisFlag == false && datas.qualifiedScore && !showTopicNum
              ? `${topicName}(${datas.typeCount}题,共${datas.typeAllScore}分)`
              : `${topicName}`}
            {analysisFlag && datas.qualifiedScore ? (
              <div>
                <span>得分：</span>
                <span style={{ color: "#00B7EF" }}>
                  {datas.score.toString()}/
                </span>
                <span>{datas.qualifiedScore}</span>
              </div>
            ) : null}
            {datas.paperName ? (
              <div className="first_title">{datas.paperName}</div>
            ) : null}
            {analysisFlag == false && datas.questionCount
              ? `(${datas.questionCount}题)`
              : ""}
          </div>
          {
            <div>
              <div className="jianda_title">
              <pre>
                {currentTopicNum}、{datas.obj.stem.item}
                {datas.qualifiedScore ? `(${datas.qualifiedScore}分)` : null}
                </pre>
              </div>
              <div className="jianda_item">
                <div className="picture">
                  {datas.obj.stem.images.length > 0
                    ? datas.obj.stem.images.map((item, index) => {
                        return <Zmage src={item} key={index} />;
                      })
                    : null}

                  {datas.obj.stem.videos.length > 0
                    ? datas.obj.stem.videos.map((item, index) => {
                        return (
                          <video
                            src={item + "?vframe/jpg/offset/1"}
                            controls="controls"
                            style={{ width: "100%",height:'3.19rem' }}
                          ></video>
                        );
                      })
                    : null}
                </div>
                {analysisFlag == false ? (
                  <div className="qustion-content">
                    <TextareaItem
                      value={this.state.textareaValue}
                      data-seed="logId"
                      onChange={this.handleTextareaChange.bind(this)}
                      autoHeight
                      rows={5}
                      count={1000}
                      placeholder="请输入答案"
                    />
                    <div style={{ position: "relative", display: "flex" }}>
                      {this.state.progressImg > 0 ? (
                        <Progress
                          percent={this.state.progressImg}
                          size="small"
                          style={{
                            width: "2.88rem",
                            position: "absolute",
                            top: "-0.35rem",
                          }}
                        />
                      ) : null}

                      <Upload
                        accept=".png, .jpg, .jpeg,.bmp,.gif"
                        listType="picture-card"
                        fileList={this.state.imgFileList}
                        onPreview={this.handlePreview}
                        onChange={(file, fileList) =>
                          this.imgHandleChange(file, fileList)
                        }
                        beforeUpload={(file, fileList) =>
                          this.beforeUpload(file, fileList)
                        }
                      >
                        {this.state.imgFileList.length > 0
                          ? null
                          : uploadButton}
                      </Upload>
                      <Modal
                        visible={this.state.previewImgFlg}
                        title={this.state.previewTitle}
                        footer={null}
                        onCancel={this.handleCancel}
                      >
                        <img
                          alt="example"
                          style={{ width: "100%" }}
                          src={this.state.previewImage}
                        />
                      </Modal>

                      <div>
                        {this.state.videoFileList.length > 0 ? (
                          <div className="show-video-box">
                            <i
                              className="icon iconfont iconguanbi"
                              onClick={this.delVideo.bind(this)}
                              style={{
                                position: "relative",
                                left: "2.8rem",
                                top: "-0.3rem",
                              }}
                            ></i>
                            <video
                              src={this.state.videoFileList[0].url}
                              controls="controls"
                              className="show-video"
                            ></video>
                          </div>
                        ) : (
                          <div>
                            <div>
                              {this.state.progressVideo > 0 ? (
                                <Progress
                                  percent={this.state.progressVideo}
                                  size="small"
                                  style={{
                                    width: "2.88rem",
                                    position: "absolute",
                                    top: "-0.35rem",
                                    left: "6rem",
                                  }}
                                />
                              ) : null}
                            </div>
                            <Upload
                              accept=".mpeg, .avi, .mp4,.asf,.wmv,.mov,.3gp,.wma,.rmvb,.rm,.flash"
                              listType="picture-card"
                              fileList={this.state.videoFileList}
                              onChange={(file, fileList) =>
                                this.videoHandleChange(file, fileList)
                              }
                              beforeUpload={(file, fileList) =>
                                this.beforeUploads(file, fileList)
                              }
                            >
                              {this.state.videoFileList.length > 0
                                ? null
                                : uploadVideoButton}
                            </Upload>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          }
        </div>
        {analysisFlag == true ? <JiandaAnalysis analysisData={datas} /> : ""}
      </div>
    );
  }
}
AnswerQuestions = createForm()(AnswerQuestions);
export default AnswerQuestions;

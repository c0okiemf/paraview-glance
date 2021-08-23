export const signallingServerUrl =
  process.env.APP_ENV === 'production'
    ? 'ws://webrtc-server-213331174.us-east-1.elb.amazonaws.com'
    : 'ws://localhost:9090';

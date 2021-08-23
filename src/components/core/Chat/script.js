import ChatBox from 'paraview-glance/src/components/core/ChatBox';
import { signallingServerUrl } from '../../../config/api';

export default {
  name: 'Chat',
  components: {
    ChatBox,
  },
  data() {
    return {
      messages: [],
      messageIncrement: 0,
      connected: false,
      serverConnection: undefined,
      adminConnection: {
        connection: undefined,
        channel: undefined,
        offer: undefined,
      },
    };
  },
  async mounted() {
    const serverConnection = new WebSocket(signallingServerUrl);
    serverConnection.onopen = async () => {
      const loginData = {
        type: 'login',
      };
      serverConnection.send(JSON.stringify(loginData));
      serverConnection.onmessage = async (message) => {
        const data = JSON.parse(message.data);
        switch (data.type) {
          case 'login': {
            if (data.success === true) {
              await this.createConnection();
            }
            break;
          }
          case 'answer': {
            const remoteDescription = new RTCSessionDescription(data);
            await this.adminConnection.connection.setRemoteDescription(
              remoteDescription
            );
            break;
          }
          case 'offer': {
            this.closeConnection();
            await this.createConnection();
            break;
          }
          case 'iceCandidate': {
            const { candidate } = data;
            this.adminConnection.connection?.addIceCandidate(
              JSON.parse(candidate)
            );
            break;
          }
        }
      };
    };
    this.serverConnection = serverConnection;
  },
  methods: {
    async createConnection() {
      const connection = new RTCPeerConnection();

      const channel = connection.createDataChannel('messaging', {
        ordered: true,
      });

      channel.onopen = () => {
        this.connected = true;
      };
      channel.onclose = () => {
        this.connected = false;
      };
      channel.onmessage = (incomingMessage) => {
        this.addMessage(incomingMessage.data, 'admin');
      };

      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);

      const sdp = offer.sdp;

      const sdpProvisionMessage = {
        type: 'offer',
        sdp,
        forUserName: 'admin',
      };
      this.serverConnection?.send(JSON.stringify(sdpProvisionMessage));

      connection.onicecandidate = (event) => {
        const iceCandidateMessage = {
          type: 'iceCandidate',
          candidate: JSON.stringify(event.candidate),
          forUserName: 'admin',
        };
        this.serverConnection?.send(JSON.stringify(iceCandidateMessage));
      };

      this.adminConnection = {
        connection,
        channel,
      };
    },
    closeConnection() {
      this?.adminConnection?.connection?.close();
    },
    addMessage(content, fromUserName) {
      const timestamp = new Date().toTimeString().split(' ')[0];
      this.messages = [
        ...this.messages,
        {
          content,
          fromUserName,
          timestamp,
          seen: false,
        },
      ];
      this.messageIncrement++;
    },
    handleSendMessageToAdmin({ content }) {
      this.adminConnection?.channel?.send(content);
      this.addMessage(content, 'user');
    },
  },
};

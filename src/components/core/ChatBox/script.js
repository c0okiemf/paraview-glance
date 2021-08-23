import Vue from 'vue';

export default {
  name: 'ChatBox',
  props: ['messages'],
  emits: ['new-message'],
  data() {
    return {
      folded: true,
      userMessage: '',
      isDarkMode: false,
    };
  },
  mounted() {
    this.isDarkMode = this.$vuetify.theme.isDark;
    window.Glance.eventBus.$on('darkModeToggle', (isDarkMode) => {
      this.isDarkMode = isDarkMode;
    });
  },
  methods: {
    scrollToMessagesBottom() {
      if (!this.folded) {
        Vue.nextTick(() => {
          this.$refs.messagesSection.scrollTop = this.$refs.messagesSection.scrollHeight;
        });
      }
    },
    handleSubmit() {
      if (this.userMessage) {
        this.$emit('new-message', { content: this.userMessage });
        this.userMessage = '';
        this.scrollToMessagesBottom();
      }
    },
    handleToggleFolded() {
      this.folded = !this.folded;
    },
  },
  watch: {
    messages() {
      this.scrollToMessagesBottom();
    },
  },
};

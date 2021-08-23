export default {
  name: 'ThemeToggle',
  data() {
    return {
      isDarkMode: false,
    };
  },
  mounted() {
    this.isDarkMode = this.$vuetify.theme.isDark;
  },
  watch: {
    isDarkMode(value) {
      this.$vuetify.theme.isDark = value;
      window.Glance.eventBus.$emit('darkModeToggle', value);
    },
  },
};

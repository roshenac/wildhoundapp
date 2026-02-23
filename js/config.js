window.WH_CONFIG = Object.assign({
  debug: false,
  enforceInstallGate: true,
  eventsUrl: "events.json",
  codebookUrl: "codebook.json",
  analyticsUrl: "",
  stateVersion: 2,
  persistDebounceMs: 300,
  maxBackupBytes: 2 * 1024 * 1024,
  remoteEventsRefreshMs: 5 * 60 * 1000,
  tallyRewardFormUrl: "https://tally.so/r/rj69o2",
  serviceWorkerEnabled: true,
  serviceWorkerPath: "service-worker.js",
  stripe: {
    links: {
      skill: "https://buy.stripe.com/14AeVf9i9cvU7h33Eh57W00",
      walk: "https://buy.stripe.com/4gM8wRbqh8fE1WJdeR57W01",
      assessment: "https://buy.stripe.com/bJe14p0LD9jIbxj6Qt57W02"
    }
  }
}, window.WH_CONFIG || {});

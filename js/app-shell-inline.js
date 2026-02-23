window.WH_APP_SHELL = `
<section class="install-gate" id="installGate" aria-live="polite">
  <div class="install-card">
    <h1>Install Wild Hound</h1>
    <p class="muted">Wild Hound can only be used from your home screen app.</p>
    <div class="btn-row">
      <button type="button" class="btn-primary" id="installAppBtn" style="display: none;">Add to Home Screen</button>
    </div>
    <p class="muted" id="installHint" style="margin-top: 8px;">Open your browser menu and choose Add to Home Screen.</p>
    <ul class="guide-list">
      <li><strong>iPhone:</strong> Tap Share, then <strong>Add to Home Screen</strong>.</li>
      <li><strong>Android:</strong> Tap browser menu, then <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
    </ul>
  </div>
</section>

<div class="app">
  <header class="topbar">
    <div class="brand">
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="7" cy="9" r="2"></circle>
        <circle cx="17" cy="9" r="2"></circle>
        <circle cx="12" cy="6" r="2"></circle>
        <path d="M6 14c0 2.5 2 4 6 4s6-1.5 6-4c0-1.6-1-3-3-3H9c-2 0-3 1.4-3 3z"></path>
      </svg>
      Wild Hound
    </div>
  </header>

  <main>
    <section class="screen active" id="dashboard">
      <h1>Dashboard</h1>
      <div class="glance-row">
        <span class="glance-chip" data-glance-rank>Rank: -</span>
        <span class="glance-chip" data-glance-points>Points: 0</span>
      </div>
      <div class="card">
        <div class="meta-grid">
          <div class="meta-item">
            <div class="meta-label">User</div>
            <div class="meta-inline">
              <div class="meta-value" id="dashboardUserName">User</div>
              <button type="button" class="btn-mini" id="dashboardEditUserBtn">Edit</button>
            </div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Trail Dog Rank</div>
            <div class="meta-value" id="rankLabel">Trail Dog Rookie</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Total Points</div>
            <div class="meta-value" id="totalPoints">0</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Skills Unlocked</div>
            <div class="meta-value" id="unlockedCount">0 / 14</div>
          </div>
        </div>
        <div class="progress-wrap">
          <div class="progress-text">
            <span id="progressLabel">0 pts to Trail Dog Pathfinder</span>
            <span id="progressPct">0%</span>
          </div>
          <div class="progress"><span id="rankProgress"></span></div>
        </div>
      </div>

      <div class="dashboard-cols">
        <div class="card highlight">
          <h3>Current Monthly Skill</h3>
          <p id="monthlySkillName">Loose-Lead Legends</p>
          <p class="muted" id="monthlySkillDesc">Confident loose-lead skills across trail conditions.</p>
        </div>
        <div class="card">
          <h3>Unlocked Skills</h3>
          <div class="tag-list" id="unlockedSkillsTags"></div>
        </div>
      </div>

      <div class="card">
        <h3>Activity Snapshot</h3>
        <div class="meta-grid">
          <div class="meta-item">
            <div class="meta-label">Assessments Booked</div>
            <div class="meta-value" id="statAssessmentsBooked">0</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Walks Booked</div>
            <div class="meta-value" id="statWalksBooked">0</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Walks Attended</div>
            <div class="meta-value" id="statWalksAttended">0</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Skills Passed</div>
            <div class="meta-value" id="statSkillsPassed">0</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Refer a Friend</h3>
        <p class="muted">Share your referral link and earn points when friends join.</p>
        <div class="form-grid">
          <label>
            Your Referral Link
            <input type="text" id="referralLinkInput" readonly />
          </label>
          <div class="btn-row" style="margin-top: 0;">
            <button class="btn-secondary" type="button" id="copyReferralBtn">Copy Link</button>
          </div>
        </div>
        <p class="muted" style="margin-top: 10px;">Referral Rewards: <span id="referralRewardCount">0</span></p>
        <div class="log-list" id="referralHistoryList"></div>
      </div>
    </section>

    <section class="screen" id="skills">
      <h1>Skills Overview</h1>
      <div class="glance-row">
        <span class="glance-chip" data-glance-rank>Rank: -</span>
        <span class="glance-chip" data-glance-points>Points: 0</span>
      </div>
      <p class="muted" style="margin-bottom: 12px;">14 Wild Hound skills arranged by progression.</p>
      <div class="skills-grid" id="skillsGrid"></div>
    </section>

    <section class="screen" id="skill-detail">
      <div class="btn-row" style="margin-top: 0; margin-bottom: 8px;">
        <button class="btn-secondary" type="button" id="backToSkillsBtn">Back to Skills</button>
      </div>
      <h1 id="detailTitle">Skill Detail</h1>
      <div class="glance-row">
        <span class="glance-chip" data-glance-rank>Rank: -</span>
        <span class="glance-chip" data-glance-points>Points: 0</span>
      </div>
      <div class="card">
        <div class="inline" style="margin-bottom: 8px;">
          <p class="muted" id="detailStatus">Unlocked</p>
          <p class="muted">Points: <strong id="skillPoints">0</strong></p>
        </div>
        <p id="detailDescription"></p>
        <div id="stepsContainer" style="margin-top: 10px;"></div>

        <div class="card" style="margin-top: 10px; margin-bottom: 0;">
          <h3 id="level5Heading">Stage 5: Stretch Goal</h3>
          <p id="trailStandardText">Complete Stages 1-4 to unlock Stage 5.</p>
          <div id="stage5StretchBox" class="checklist" style="margin-top: 8px;"></div>
        </div>

        <div class="btn-row">
          <button class="btn-gold" id="submitEvidenceBtn">Book In For Skill Assessment</button>
          <button class="btn-secondary" id="practiceGainBtn">Log Practice</button>
        </div>

        <div class="card" id="practiceLogPanel" style="margin-top: 10px; display: none;">
          <h3>Practice Log</h3>
          <p class="muted">Track your self-practice sessions.</p>
          <form id="practiceForm" class="form-grid">
            <label>
              Date
              <input type="date" id="practiceDate" required />
            </label>
            <label>
              Duration (minutes)
              <input type="number" id="practiceDuration" min="5" step="5" value="20" required />
            </label>
            <label>
              Focus Area
              <select id="practiceFocus">
                <option value="Stage 1">Stage 1</option>
                <option value="Stage 2">Stage 2</option>
                <option value="Stage 3">Stage 3</option>
                <option value="Stage 4">Stage 4</option>
                <option value="Stage 5 Stretch Goal">Stage 5 Stretch Goal</option>
              </select>
            </label>
            <label>
              Notes
              <textarea id="practiceNotes" placeholder="How did today go on trail?"></textarea>
            </label>
            <div class="btn-row" style="margin-top: 0;">
              <button type="submit" class="btn-primary">Save Practice Log</button>
              <button type="button" class="btn-secondary" id="closePracticePanelBtn">Cancel</button>
            </div>
          </form>
          <details class="collapse-card" style="margin-top: 10px;">
            <summary>Recent Logs (<span id="practiceLogCount">0</span>)</summary>
            <div class="log-list" id="practiceLogList"></div>
          </details>
        </div>

        <div class="badge-placeholder" id="skillBadgeBox">Badge Icon Placeholder</div>
      </div>
    </section>

    <section class="screen" id="rewards">
      <h1>Points & Rewards</h1>
      <div class="glance-row">
        <span class="glance-chip" data-glance-rank>Rank: -</span>
        <span class="glance-chip" data-glance-points>Points: 0</span>
      </div>
      <div class="card reward-hero">
        <p class="reward-kicker">Trail Reward Journey</p>
        <p class="reward-points"><span id="rewardPoints">0</span> pts</p>
        <p class="muted" id="nextRewardText">Next reward in 0 points.</p>
        <div class="progress-wrap" style="margin-top: 12px;">
          <div class="progress-text">
            <span id="rewardJourneyLabel">Progress to next reward</span>
            <span id="rewardJourneyPct">0%</span>
          </div>
          <div class="progress"><span id="rewardJourneyProgress"></span></div>
        </div>
        <div class="btn-row">
          <button class="btn-gold" type="button" id="jumpToBookingBtn">Book Your Next Walk</button>
        </div>
      </div>

      <details class="card collapse-card" open>
        <summary>Milestone Rewards</summary>
        <p class="muted">Higher tiers now include gear, recognition, and premium trail experiences.</p>
        <div class="ladder" id="rewardsLadder">
          <div class="step" data-threshold="100">Trail Dog Rookie (100 pts) - Sticker</div>
          <div class="step" data-threshold="250">Trail Dog Explorer (250 pts) - Patch</div>
          <div class="step" data-threshold="500">Trail Dog Advanced (500 pts) - Mug</div>
          <div class="step" data-threshold="600">Trail Dog Pathfinder (600 pts) - Personalized Trail Tag + Certificate</div>
          <div class="step" data-threshold="900">Trail Dog Expert (900 pts) - Pro Gear Bundle + Club Spotlight</div>
          <div class="step" data-threshold="1300">Trail Dog Master (1300 pts) - Master Trophy + 1:1 Assessment Day + Certificate</div>
          <div class="step" data-kind="walks-attended" data-walks="10">Attend 10 Walks - Trail Commitment Crate (Bandana + Treat Pouch)</div>
          <div class="step" data-kind="all-skills-pass">All 14 Skills Passed - Skills Mastery Medal + Hall of Fame Feature</div>
        </div>
      </details>

      <details class="card collapse-card">
        <summary>Points History</summary>
        <div class="log-list" id="pointsHistoryList"></div>
      </details>
    </section>

    <section class="screen" id="booking">
      <h1>Assessments & Monthly Walks</h1>
      <div class="glance-row">
        <span class="glance-chip" data-glance-rank>Rank: -</span>
        <span class="glance-chip" data-glance-points>Points: 0</span>
      </div>
      <div class="card">
        <h3>Booking Overview</h3>
        <p class="muted">See your upcoming bookings, available events, and past/completed events in one place.</p>
        <details class="filter-drawer">
          <summary>Filters</summary>
          <div class="form-grid" style="margin-top: 10px;">
            <label>
              Event Type
              <select id="bookingTypeFilter">
                <option value="all">All Events</option>
                <option value="assessment">Assessment Days</option>
                <option value="hillwalk">Monthly Hill Walks</option>
              </select>
            </label>
            <label>
              Status
              <select id="bookingStatusFilter">
                <option value="all">All Statuses</option>
                <option value="pending">Not Yet</option>
                <option value="booked">Booked</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="passed">Passed</option>
              </select>
            </label>
          </div>
        </details>
      </div>
      <div class="slots" id="bookingEvents"></div>
    </section>

    <section class="screen" id="logged">
      <h1>Logged Skills</h1>
      <div class="glance-row">
        <span class="glance-chip" data-glance-rank>Rank: -</span>
        <span class="glance-chip" data-glance-points>Points: 0</span>
      </div>
      <div class="card">
        <p class="muted">Review all saved practice logs by skill.</p>
        <p style="margin-top: 6px;"><strong>Total Logged Sessions:</strong> <span id="totalLoggedSessions">0</span></p>
        <div class="form-grid" style="margin-top: 8px;">
          <label>
            View Logs
            <select id="loggedViewModeSelect">
              <option value="skill">Group by Skill</option>
              <option value="date">View by Date</option>
            </select>
          </label>
        </div>
        <div class="bulk-bar">
          <button class="btn-quiet" type="button" id="toggleLogSelectModeBtn">Select Multiple</button>
          <button class="btn-gold" type="button" id="deleteSelectedLogsBtn" style="display: none;">Delete Selected</button>
          <span class="muted" id="selectedLogsCountText" style="display: none;">0 selected</span>
        </div>
      </div>
      <div id="loggedSkillsList"></div>
    </section>

    <section class="screen" id="settings">
      <h1>About & FAQ</h1>
      <div class="glance-row">
        <span class="glance-chip" data-glance-rank>Rank: -</span>
        <span class="glance-chip" data-glance-points>Points: 0</span>
      </div>

      <details class="card highlight collapse-card" open>
        <summary>Free Trail Packing Guide</summary>
        <p class="muted">Download the Trail-Ready Dog Starter Guide (PDF packing list).</p>
        <div class="btn-row">
          <a class="btn-primary" href="https://dl.dropboxusercontent.com/scl/fi/8o96fvysdhv94dz4jczu3/Wild_Hound_Club_Trail-Ready_Dog_Starter_Guide.pdf?rlkey=dbtnhoxsv1hy1m5ttqctf0t7f&amp;st=yl8hnojm" target="_blank" rel="noopener noreferrer">Open Packing Guide</a>
        </div>
      </details>

      <details class="card collapse-card">
        <summary>How Points Are Earned</summary>
        <div id="pointsRuleSummary" class="muted" style="margin-top: 8px;"></div>
      </details>

      <details class="card collapse-card" open>
        <summary>How Wild Hound Works</summary>
        <ol class="guide-list">
          <li>Unlock skills from the Skills screen using a hill walk code or payment.</li>
          <li>Open an unlocked skill and complete Stages 1 to 3.</li>
          <li>At Stage 4, book an assessment and enter assessor code to mark Passed or Needs More Work.</li>
          <li>Stage 5 Stretch Goal unlocks only after Stage 4 is passed.</li>
          <li>Book assessments and monthly walks from Booking and keep climbing points.</li>
        </ol>
      </details>

      <details class="card collapse-card">
        <summary>Unlocking Skills</summary>
        <ul class="guide-list">
          <li><strong>Hill walk code:</strong> tap Unlock Skill and enter your code.</li>
          <li><strong>Payment:</strong> tap Unlock Skill and go to payment page.</li>
          <li>Only unlocked skills can be opened and progressed.</li>
        </ul>
      </details>

      <details class="card collapse-card">
        <summary>Booking Walks & Assessments</summary>
        <ul class="guide-list">
          <li>Assessments and monthly hill walks are shown together in chronological order.</li>
          <li>Each hill walk shows the linked skill focus.</li>
          <li>After booking, you can pay from the event card.</li>
          <li>Canceling a booking removes its related booking points.</li>
        </ul>
      </details>

      <details class="card collapse-card">
        <summary>Progression Rules</summary>
        <ul class="guide-list">
          <li>Stage 2 unlocks after Stage 1 is complete, and so on.</li>
          <li>Stage 4 is assessment pass criteria (not a checkbox stage).</li>
          <li><strong>PASS5</strong> marks skill as passed.</li>
          <li><strong>REWORK5</strong> marks needs more work and applies £5 assessment discount until passed.</li>
          <li>Stage 5 is hidden until the skill is passed.</li>
        </ul>
      </details>

      <details class="card collapse-card">
        <summary>What Is Not Rewarded</summary>
        <ul class="guide-list">
          <li>Unlimited evidence submissions</li>
          <li>Daily logging spam</li>
          <li>Chat comments</li>
          <li>Passive activity</li>
        </ul>
      </details>
    </section>
  </main>
</div>

<div class="mobile-sticky-cta" id="mobileStickyCta">
  <button class="btn-gold" type="button" id="mobileStickyCtaBtn">Book In For Skill Assessment</button>
</div>

<nav class="bottom-nav">
  <a class="tab-btn active" data-screen="dashboard" href="dashboard.html"><svg class="icon" viewBox="0 0 24 24"><path d="M3 11l9-7 9 7"></path><path d="M5 10v10h14V10"></path></svg>Home</a>
  <a class="tab-btn" data-screen="skills" href="skills.html"><svg class="icon" viewBox="0 0 24 24"><path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path></svg>Skills</a>
  <a class="tab-btn" data-screen="rewards" href="rewards.html"><svg class="icon" viewBox="0 0 24 24"><path d="M12 3l3 6 6 .9-4.4 4.2 1 6L12 17l-5.6 3.1 1-6L3 9.9 9 9z"></path></svg>Rewards</a>
  <a class="tab-btn" data-screen="booking" href="booking.html"><svg class="icon" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M7 3v4"></path><path d="M17 3v4"></path><path d="M3 10h18"></path></svg>Booking</a>
  <a class="tab-btn" data-screen="logged" href="logged.html"><svg class="icon" viewBox="0 0 24 24"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><circle cx="4" cy="6" r="1.5"></circle><circle cx="4" cy="12" r="1.5"></circle><circle cx="4" cy="18" r="1.5"></circle></svg>Logged</a>
  <a class="tab-btn" data-screen="settings" href="about.html"><svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"></circle><path d="M12 3v2.2"></path><path d="M12 18.8V21"></path><path d="M3 12h2.2"></path><path d="M18.8 12H21"></path><path d="M5.8 5.8l1.6 1.6"></path><path d="M16.6 16.6l1.6 1.6"></path><path d="M18.2 5.8l-1.6 1.6"></path><path d="M7.4 16.6l-1.6 1.6"></path></svg>About</a>
</nav>

<div class="toast-wrap" id="toastWrap"></div>

<div class="modal-backdrop" id="logEditModalBackdrop">
  <div class="modal">
    <h3>Edit Log</h3>
    <form id="logEditForm" class="form-grid">
      <label>
        Skill
        <select id="logEditSkill" required></select>
      </label>
      <label>
        Date
        <input type="date" id="logEditDate" required />
      </label>
      <label>
        Step
        <select id="logEditStep">
          <option value="Stage 1">Stage 1</option>
          <option value="Stage 2">Stage 2</option>
          <option value="Stage 3">Stage 3</option>
          <option value="Stage 4">Stage 4</option>
          <option value="Stage 5 Stretch Goal">Stage 5 Stretch Goal</option>
        </select>
      </label>
      <label>
        Duration (minutes)
        <input type="number" id="logEditDuration" min="1" required />
      </label>
      <label>
        Comment
        <textarea id="logEditComment"></textarea>
      </label>
      <div class="btn-row" style="margin-top: 0;">
        <button type="submit" class="btn-primary">Save Changes</button>
        <button type="button" class="btn-secondary" id="cancelLogEditBtn">Cancel</button>
      </div>
    </form>
  </div>
</div>

<div class="modal-backdrop" id="unlockSkillModalBackdrop">
  <div class="modal">
    <h3 id="unlockSkillTitle">Unlock Skill</h3>
    <p class="muted" id="unlockSkillPrompt">Choose how you want to unlock this skill.</p>
    <div class="btn-row">
      <button type="button" class="btn-primary" id="unlockViaCodeBtn">Enter Hill Walk Code</button>
      <button type="button" class="btn-secondary" id="unlockViaPaymentBtn">Go to Payment Page</button>
      <button type="button" class="btn-secondary" id="unlockSkillCancelBtn">Cancel</button>
    </div>
    <div id="unlockCodeSection" class="form-grid" style="display: none; margin-top: 10px;">
      <label>
        Hill Walk Code
        <input type="text" id="unlockCodeInput" placeholder="Enter your code" />
      </label>
      <div class="btn-row" style="margin-top: 0;">
        <button type="button" class="btn-primary" id="unlockCodeSubmitBtn">Unlock with Code</button>
        <button type="button" class="btn-secondary" id="unlockCodeCancelBtn">Back</button>
      </div>
    </div>
  </div>
</div>
`;

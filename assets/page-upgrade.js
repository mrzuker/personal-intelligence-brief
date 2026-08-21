(() => {
  const toMinutes = (value) => {
    const match = String(value || "").match(/(\d{1,2}):(\d{2})/);
    return match ? Number(match[1]) * 60 + Number(match[2]) : -1;
  };

  const upgradeDailyDigest = () => {
    const day = document.querySelector(".digest-day");
    const timeline = day?.querySelector(":scope > .edition-timeline");
    const editions = day
      ? [...day.querySelectorAll(":scope > section.digest-edition")]
      : [];
    if (!day || !timeline || !editions.length) return;

    const upgraded = editions.map((section) => {
      const header = section.querySelector(":scope > header");
      const timeText = header?.querySelector(".eyebrow")?.textContent?.trim() || "";
      const details = document.createElement("details");
      details.className = "digest-edition";
      details.id = section.id;

      const summary = document.createElement("summary");
      summary.className = "digest-edition-summary";
      const heading = header?.querySelector(":scope > div");
      if (heading) summary.append(heading);

      const meta = document.createElement("div");
      meta.className = "digest-edition-meta";
      const count = header?.querySelector(":scope > small");
      if (count) meta.append(count);
      const control = document.createElement("span");
      control.className = "collapse-control";
      control.setAttribute("aria-hidden", "true");
      control.innerHTML = '<span class="collapse-label"></span><span class="collapse-icon"></span>';
      meta.append(control);
      summary.append(meta);
      details.append(summary);

      [...section.children]
        .filter((child) => child !== header)
        .forEach((child) => details.append(child));

      const supplements = [];
      let next = section.nextElementSibling;
      while (next?.matches(".daily-supplement-area")) {
        const following = next.nextElementSibling;
        supplements.push(next);
        next = following;
      }
      section.replaceWith(details);
      supplements.forEach((supplement) => details.append(supplement));
      return { details, minutes: toMinutes(timeText) };
    });

    upgraded.sort((left, right) => right.minutes - left.minutes);
    const fragment = document.createDocumentFragment();
    upgraded.forEach(({ details }, index) => {
      details.open = index === 0;
      fragment.append(details);
    });
    timeline.after(fragment);

    [...timeline.querySelectorAll(":scope > a")]
      .sort((left, right) => {
        return toMinutes(right.querySelector("time")?.textContent) -
          toMinutes(left.querySelector("time")?.textContent);
      })
      .forEach((link) => timeline.append(link));
    timeline.setAttribute("aria-label", "当日更新，按最新在前排列");

    const note = document.createElement("p");
    note.className = "edition-order-note";
    note.textContent = "当日更新 · 最新在前";
    timeline.before(note);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", upgradeDailyDigest, { once: true });
  } else {
    upgradeDailyDigest();
  }
})();

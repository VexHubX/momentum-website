(() => {
  "use strict";
  const config = window.VEXHUB_CONFIG || {};
  const grid = document.querySelector("#script-grid");
  const search = document.querySelector("#search");
  const categories = document.querySelector("#categories");
  const count = document.querySelector("#result-count");
  const toast = document.querySelector("#toast");
  let scripts = [];
  let selectedCategory = "all";
  let toastTimer;

  const configured = () => config.supabaseUrl && config.supabaseAnonKey &&
    !config.supabaseUrl.includes("YOUR_") && !config.supabaseAnonKey.includes("YOUR_");

  function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function stateCard(title, detail) {
    const box = document.createElement("div");
    box.className = "state-card";
    const heading = document.createElement("h3");
    heading.textContent = title;
    const text = document.createElement("p");
    text.className = "state-detail";
    text.textContent = detail;
    box.append(heading, text);
    grid.replaceChildren(box);
  }

  function formatDate(value) {
    if (!value) return "Published recently";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Published recently";
    return `Updated ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date)}`;
  }

  function addFilter(label, value) {
    const button = document.createElement("button");
    button.className = `filter-chip${selectedCategory === value ? " selected" : ""}`;
    button.type = "button";
    button.dataset.category = value;
    button.setAttribute("aria-pressed", String(selectedCategory === value));
    button.textContent = label;
    categories.append(button);
  }

  function renderFilters() {
    const unique = [...new Set(scripts.map(item => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    categories.replaceChildren();
    addFilter("All scripts", "all");
    unique.forEach(category => addFilter(category, category));
    if (selectedCategory !== "all" && !unique.includes(selectedCategory)) selectedCategory = "all";
    categories.querySelectorAll("button").forEach(button => {
      const active = button.dataset.category === selectedCategory;
      button.classList.toggle("selected", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function makeCard(item, index) {
    const card = document.createElement("article");
    card.className = "script-card";
    card.style.animationDelay = `${Math.min(index * 45, 250)}ms`;
    const top = document.createElement("div");
    top.className = "card-top";
    const category = document.createElement("span");
    category.className = "category-label";
    category.textContent = item.category || "General";
    const updated = document.createElement("span");
    updated.className = "updated-label";
    updated.textContent = formatDate(item.updated_at || item.created_at);
    top.append(category, updated);
    const title = document.createElement("h3");
    title.textContent = item.title;
    const description = document.createElement("p");
    description.className = "script-description";
    description.textContent = item.description;
    const tags = document.createElement("div");
    tags.className = "tag-list";
    (Array.isArray(item.tags) ? item.tags : []).slice(0, 5).forEach(tag => {
      const element = document.createElement("span");
      element.className = "tag";
      element.textContent = tag;
      tags.append(element);
    });
    const bottom = document.createElement("div");
    bottom.className = "card-bottom";
    const published = document.createElement("span");
    published.className = "published-date";
    published.textContent = `Published ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(item.created_at))}`;
    const copy = document.createElement("button");
    copy.className = "copy-button";
    copy.type = "button";
    copy.textContent = "Copy script";
    copy.addEventListener("click", async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(item.code);
        else {
          const area = document.createElement("textarea");
          area.value = item.code;
          area.setAttribute("readonly", "");
          area.style.position = "fixed";
          area.style.opacity = "0";
          document.body.append(area);
          area.select();
          const success = document.execCommand("copy");
          area.remove();
          if (!success) throw new Error("Clipboard unavailable");
        }
        copy.textContent = "Copied ✓";
        copy.classList.add("copied");
        notify("Script copied to clipboard.");
        setTimeout(() => { copy.textContent = "Copy script"; copy.classList.remove("copied"); }, 1800);
      } catch {
        notify("Could not access clipboard. Try a secure browser context.");
      }
    });
    bottom.append(published, copy);
    card.append(top, title, description);
    if (tags.childElementCount) card.append(tags);
    card.append(bottom);
    return card;
  }

  function render() {
    renderFilters();
    const term = search.value.trim().toLocaleLowerCase();
    const visible = scripts.filter(item => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const searchable = [item.title, item.description, item.category, ...(Array.isArray(item.tags) ? item.tags : [])].join(" ").toLocaleLowerCase();
      return matchesCategory && searchable.includes(term);
    });
    count.textContent = `${visible.length} ${visible.length === 1 ? "script" : "scripts"}`;
    if (!visible.length) {
      stateCard(scripts.length ? "No scripts found" : "The library is ready for its first script", scripts.length ? "Try a different search or category." : "Published scripts will appear here once an authorized Vexhub admin adds them.");
      return;
    }
    grid.replaceChildren(...visible.map(makeCard));
  }

  async function load() {
    document.querySelector("#year").textContent = String(new Date().getFullYear());
    if (!configured()) {
      count.textContent = "Setup required";
      stateCard("Connect Vexhub to Supabase", "Add your Supabase project URL and public anon key to config.js, then run supabase/schema.sql. Setup steps are in the README.");
      return;
    }
    if (!window.supabase?.createClient) {
      count.textContent = "Connection unavailable";
      stateCard("Could not load the database client", "Check your internet connection and reload the page.");
      return;
    }
    try {
      const client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
      const { data, error } = await client.from("scripts").select("id,title,description,category,tags,code,created_at,updated_at").eq("is_published", true).order("updated_at", { ascending: false });
      if (error) throw error;
      scripts = data || [];
      render();
    } catch (error) {
      console.error("Vexhub library load failed:", error.message);
      count.textContent = "Unable to load";
      stateCard("The library could not be reached", "Check the Supabase project URL, anon key, database setup, and connection, then reload.");
    }
  }

  search.addEventListener("input", render);
  categories.addEventListener("click", event => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    selectedCategory = button.dataset.category;
    render();
  });
  document.addEventListener("keydown", event => {
    const target = event.target;
    const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
    if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      search.focus();
    }
    if (event.key === "Escape" && target === search) { search.value = ""; render(); search.blur(); }
  });
  load();
})();

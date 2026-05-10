package obu

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"time"
)

type Browser struct {
	Client *Client
	CDP    *CDP
}

func NewBrowser(client *Client) *Browser {
	return &Browser{Client: client, CDP: NewCDP(client)}
}

func (b *Browser) Connect() error {
	return b.Client.Connect()
}

func (b *Browser) Close() error {
	return b.Client.Close()
}

func (b *Browser) NewTab(options ...GotoOptions) (*Tab, error) {
	result, err := b.Client.CreateTab()
	if err != nil {
		return nil, err
	}
	tabID, err := tabIDFromValue(result, "createTab response")
	if err != nil {
		return nil, err
	}
	tab := b.Tab(tabID)
	if len(options) > 0 && options[0].URL != "" {
		if _, err := tab.Goto(options[0].URL, options[0]); err != nil {
			return nil, err
		}
	}
	return tab, nil
}

func (b *Browser) Tab(tabID int) *Tab {
	tab := &Tab{Browser: b, ID: tabID}
	tab.initPlaywright()
	return tab
}

func (b *Browser) GetTabs() (any, error) {
	return b.Client.GetTabs()
}

type Tab struct {
	Browser    *Browser
	ID         int
	Playwright *TabPlaywright
}

func (t *Tab) Goto(url string, options ...GotoOptions) (any, error) {
	option := GotoOptions{}
	if len(options) > 0 {
		option = options[0]
	}
	return t.Browser.CDP.Navigate(t.ID, url, option)
}

func (t *Tab) WaitForLoadState(options ...WaitForLoadStateOptions) error {
	option := WaitForLoadStateOptions{}
	if len(options) > 0 {
		option = options[0]
	}
	return t.Browser.CDP.WaitForLoadState(t.ID, option)
}

func (t *Tab) DOMSnapshot() (string, error) {
	value, err := t.Evaluate("document.body?.innerText ?? ''")
	if err != nil {
		return "", err
	}
	if value == nil {
		return "", nil
	}
	return fmt.Sprint(value), nil
}

func (t *Tab) Evaluate(expression string, awaitPromise ...bool) (any, error) {
	option := EvaluateOptions{}
	if len(awaitPromise) > 0 {
		option.AwaitPromise = &awaitPromise[0]
	}
	return t.Browser.CDP.Evaluate(t.ID, expression, option)
}

func (t *Tab) Title() (string, error) {
	value, err := t.Evaluate("document.title ?? ''")
	if err != nil {
		return "", err
	}
	return fmt.Sprint(value), nil
}

func (t *Tab) URL() (string, error) {
	value, err := t.Evaluate("location.href")
	if err != nil {
		return "", err
	}
	return fmt.Sprint(value), nil
}

func (t *Tab) WaitForTimeout(timeout time.Duration) error {
	if timeout < 0 {
		return errors.New("timeout must be non-negative")
	}
	time.Sleep(timeout)
	return nil
}

func (t *Tab) Locator(selector string) *Locator {
	return &Locator{Tab: t, Selector: selector}
}

func (t *Tab) Close() (any, error) {
	return t.Browser.CDP.Call(t.ID, "Page.close", nil, CDPCallOptions{})
}

type TabPlaywright struct {
	tab *Tab
}

func (t *Tab) initPlaywright() {
	if t.Playwright == nil {
		t.Playwright = &TabPlaywright{}
	}
	t.Playwright.tab = t
}

func (p *TabPlaywright) WaitForLoadState(options ...WaitForLoadStateOptions) error {
	return p.tab.WaitForLoadState(options...)
}

func (p *TabPlaywright) DOMSnapshot() (string, error) {
	return p.tab.DOMSnapshot()
}

func (p *TabPlaywright) Title() (string, error) {
	return p.tab.Title()
}

func (p *TabPlaywright) URL() (string, error) {
	return p.tab.URL()
}

func (p *TabPlaywright) WaitForTimeout(timeout time.Duration) error {
	return p.tab.WaitForTimeout(timeout)
}

func (p *TabPlaywright) Locator(selector string) *Locator {
	return p.tab.Locator(selector)
}

type Locator struct {
	Tab      *Tab
	Selector string
}

func (l *Locator) InnerText(timeout time.Duration) (string, error) {
	if l.Selector == "" {
		return "", errors.New("locator requires a selector")
	}
	if timeout < 0 {
		return "", errors.New("timeout must be non-negative")
	}
	if timeout == 0 {
		timeout = DefaultNavigationTimeout
	}
	value, err := l.Tab.Evaluate(locatorInnerTextExpression(l.Selector, timeout), true)
	if err != nil {
		return "", err
	}
	if value == nil {
		return "", nil
	}
	return fmt.Sprint(value), nil
}

type CDP struct {
	client        *Client
	attachedTabID map[int]bool
}

func NewCDP(client *Client) *CDP {
	return &CDP{client: client, attachedTabID: map[int]bool{}}
}

type CDPCallOptions struct {
	Timeout time.Duration
}

type EvaluateOptions struct {
	AwaitPromise *bool
}

type GotoOptions struct {
	URL       string
	WaitUntil string
	Timeout   time.Duration
}

type WaitForLoadStateOptions struct {
	State   string
	Timeout time.Duration
}

func (c *CDP) Call(tabID int, method string, commandParams Params, options CDPCallOptions) (any, error) {
	if err := c.EnsureAttached(tabID); err != nil {
		return nil, err
	}
	params := Params{
		"target":        Params{"tabId": tabID},
		"method":        method,
		"commandParams": commandParams,
	}
	if options.Timeout > 0 {
		params["timeoutMs"] = int(options.Timeout / time.Millisecond)
	}
	return c.client.Request("executeCdp", params)
}

func (c *CDP) Evaluate(tabID int, expression string, options EvaluateOptions) (any, error) {
	commandParams := Params{
		"expression":    expression,
		"returnByValue": true,
	}
	if options.AwaitPromise != nil {
		commandParams["awaitPromise"] = *options.AwaitPromise
	}
	result, err := c.Call(tabID, "Runtime.evaluate", commandParams, CDPCallOptions{})
	if err != nil {
		return nil, err
	}
	resultMap, ok := result.(map[string]any)
	if !ok {
		return nil, nil
	}
	if exception, ok := resultMap["exceptionDetails"].(map[string]any); ok {
		if text, ok := exception["text"].(string); ok && text != "" {
			return nil, errors.New(text)
		}
		return nil, errors.New("Open Browser Use evaluation failed")
	}
	remoteObject, ok := resultMap["result"].(map[string]any)
	if !ok {
		return nil, nil
	}
	return remoteObject["value"], nil
}

func (c *CDP) Navigate(tabID int, url string, options GotoOptions) (any, error) {
	if url == "" {
		return nil, errors.New("goto requires a URL")
	}
	waitUntil := options.WaitUntil
	if waitUntil == "" {
		waitUntil = LoadStateLoad
	}
	if err := assertSupportedLoadState(waitUntil); err != nil {
		return nil, err
	}
	timeout := options.Timeout
	if timeout == 0 {
		timeout = DefaultNavigationTimeout
	}
	if _, err := c.Call(tabID, "Page.enable", nil, CDPCallOptions{}); err != nil {
		return nil, err
	}
	result, err := c.Call(tabID, "Page.navigate", Params{"url": url}, CDPCallOptions{Timeout: timeout})
	if err != nil {
		return nil, err
	}
	if resultMap, ok := result.(map[string]any); ok {
		if errorText, ok := resultMap["errorText"].(string); ok && errorText != "" {
			return nil, fmt.Errorf("browser failed to navigate tab %d: %s", tabID, errorText)
		}
	}
	if err := c.WaitForLoadState(tabID, WaitForLoadStateOptions{State: waitUntil, Timeout: timeout}); err != nil {
		return nil, err
	}
	return result, nil
}

func (c *CDP) WaitForLoadState(tabID int, options WaitForLoadStateOptions) error {
	state := options.State
	if state == "" {
		state = LoadStateLoad
	}
	if err := assertSupportedLoadState(state); err != nil {
		return err
	}
	timeout := options.Timeout
	if timeout == 0 {
		timeout = DefaultNavigationTimeout
	}
	if _, err := c.Call(tabID, "Page.enable", nil, CDPCallOptions{}); err != nil {
		return err
	}
	deadline := time.Now().Add(timeout)
	for {
		documentState, _ := c.ReadDocumentState(tabID)
		if documentStateMatches(documentState, state) {
			return nil
		}
		if time.Now().After(deadline) {
			return fmt.Errorf("timed out waiting for %s in tab %d", state, tabID)
		}
		time.Sleep(100 * time.Millisecond)
	}
}

func (c *CDP) ReadDocumentState(tabID int) (map[string]any, error) {
	value, err := c.Evaluate(tabID, "({ href: window.location.href, readyState: document.readyState })", EvaluateOptions{})
	if err != nil {
		return nil, err
	}
	if result, ok := value.(map[string]any); ok {
		return result, nil
	}
	return nil, nil
}

func (c *CDP) EnsureAttached(tabID int) error {
	if c.attachedTabID[tabID] {
		return nil
	}
	if _, err := c.client.Attach(tabID); err != nil {
		return err
	}
	c.attachedTabID[tabID] = true
	return nil
}

func tabIDFromValue(value any, label string) (int, error) {
	result, ok := value.(map[string]any)
	if !ok {
		return 0, fmt.Errorf("%s did not include a tab object", label)
	}
	switch id := result["id"].(type) {
	case float64:
		if id > 0 && id == float64(int(id)) {
			return int(id), nil
		}
	case int:
		if id > 0 {
			return id, nil
		}
	case string:
		parsed, err := strconv.Atoi(id)
		if err == nil && parsed > 0 {
			return parsed, nil
		}
	}
	return 0, fmt.Errorf("%s did not include a numeric tab id", label)
}

func assertSupportedLoadState(state string) error {
	if state != LoadStateDOMContentLoaded && state != LoadStateLoad {
		return fmt.Errorf("unsupported load state %q. Use %q or %q", state, LoadStateDOMContentLoaded, LoadStateLoad)
	}
	return nil
}

func documentStateMatches(documentState map[string]any, state string) bool {
	readyState, _ := documentState["readyState"].(string)
	return readyState == "complete" || (state == LoadStateDOMContentLoaded && readyState == "interactive")
}

func locatorInnerTextExpression(selector string, timeout time.Duration) string {
	selectorJSON, _ := json.Marshal(selector)
	return fmt.Sprintf(`(async () => {
  const selector = %s;
  const deadline = performance.now() + %d;
  while (true) {
    const element = document.querySelector(selector);
    if (element) {
      return element.innerText ?? element.textContent ?? "";
    }
    if (performance.now() >= deadline) {
      throw new Error("Timed out waiting for locator " + selector);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
})()`, selectorJSON, int(timeout/time.Millisecond))
}

Let's make is to if you click on a compound in the library, it opens up showing only that, not the rest of the library. Also allow for editing. Last the Dosing function should use this library for drop-down

# Modules
## Dashboard
- [ ] Need to fix shot imaging and heatmap
	- ![[Pasted image 20260209060003.png]]
	- Ideally these are clickable and will show dose history
	- ![[Pasted image 20260209055634.png]]
	- 
	  ```json
	  {
  "injection_dashboard": [
    {
      "id": "lower_right_ab",
      "site_name": "Lower Right Ab",
      "usage_l7d": 0,
      "status": "Prime",
      "badge_color": "green",
      "last_injected_at": "2026-02-02T08:00:00Z",
      "is_recommended": true
    },
    {
      "id": "outer_right_thigh",
      "site_name": "Outer Right Thigh",
      "usage_l7d": 0,
      "status": "Prime",
      "badge_color": "green",
      "last_injected_at": "2026-02-01T18:00:00Z",
      "is_recommended": true
    },
    {
      "id": "lower_left_ab",
      "site_name": "Lower Left Ab",
      "usage_l7d": 1,
      "status": "Ready",
      "badge_color": "yellow",
      "last_injected_at": "2026-02-06T08:30:00Z",
      "is_recommended": false
    },
    {
      "id": "upper_left_ab",
      "site_name": "Upper Left Ab",
      "usage_l7d": 3,
      "status": "Resting",
      "badge_color": "orange",
      "last_injected_at": "2026-02-07T09:00:00Z",
      "is_recommended": false
    },
    {
      "id": "upper_right_ab",
      "site_name": "Upper Right Ab",
      "usage_l7d": 5,
      "status": "Avoid",
      "badge_color": "red",
      "last_injected_at": "2026-02-08T07:45:00Z",
      "is_recommended": false
    }
  ]
}
	  ```
- [x] Add dosing log for yesterday, today, and planned for tomorrow under cycles
- [x] Change heatmap from body to just squares or other view  with injection namesand place in top section.  Split bottom into Active Compounds, Recent Dosing, and Cycles
- [ ] Reduce injection mappings to just basic subq and IM locations; add to settings for adding more
## Library & Active Compounds
- [ ] Need to add planned dose vs dose vs hypothetical
- [ ] Add "Active" label and filter
- [ ] Add "Planned" label and filter
- [ ] Add "Inventory" section
- [ ] Add "Order" section
- [ ] Testosterone should have baseline numbers and show increase based off dosing
- [ ] Need to add reconstitution logic
- [ ] Merge Active Compound and Library views
- ![[Pasted image 20260209050853.png]]
- This should be view for any thing in library.  The page should have a baseline section that will be used to inform the graph
- Testosterone should include a bloodwork panel section that will add all related blood markers
- HGH should have the same
- [ ] Add Orals section to include things like Cialis
- [ ] Change the scale of testosterone to be 1500 max
- [ ] Add calendar to active compound and library view with notation for injection dates like on dashboard
- [ ] Blends should be factored into active compound in system.  If taking BPC + TB4, each should be represented
- [ ] multicolum for benefits and side effects.  improve this tagging so they are tags that are easy to add and search
## History
- Dosing in mg, mcg, IU, or mL should all show effective mg dosing
- Add widgets for history
## Cycles

- [ ] Need to add protocol and plans
- [ ] Logged dose from cycle planner should log on the planned day.   Need to add time.  Log should bring the same pop-up.
- [ ] Move logged doses to taken.  Move skipped to skipped.  Make widgets clickable.
## Settings
- [ ] Add Section for weight and daily mood tracking - Simple Journal for calendar?
- [ ] Add Peptide Calculator
	- ![[Pasted image 20260209074554.png]]

# SaaS
- [ ] Register domain
- [ ] Build iOS app
- [ ] Build Android app
- [ ] Build web app

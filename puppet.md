Why use puppet?

* Reduce Entropy
* Change Management
* Infrastructure as code
* * See what happened by just doing a diff. Get work done instead of
    playing detective for hours.

How Puppet works

* Define the state of the system
* * Not every single aspect, but the parts we care about.
* * Simulate with the resource graph. Run in no-op mode.

# Puppet assigns and maintains a node's desired role.

* Have a provisioning install that is as basic as possible.

# Managing configuration drift
* Puppet is about state

# Puppet data flow
* Node sends facts to the puppet master,
* Master receives facts and classifies system. Compiles catalog

# Facts
* Key-value pairs
* Inventory of the system

# Custom Facts
* Written in ruby
* 

# Catalog
* Comprehensive list of resources

# Reporting
* Every change is correlated to every resource in the report that is
  generated.

workflow "Tests" {
  on = "push"
  resolves = ["Dependencies"]
}

action "Dependencies" {
  uses = "actions/npm@master"
  args = "--prefix source/image-handler install"
}

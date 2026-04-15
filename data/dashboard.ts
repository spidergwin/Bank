export const dashboardConfig = {
  title: "Dashboard Overview",
  balanceLabel: "Current Balance",
  accountNumberLabel: "Account Number",
  recentTransactionsLabel: "Recent Transactions",
  quickActions: [
    { label: "Transfer", href: "/transfer", icon: "IconArrowUpRight" },
    { label: "Withdraw", href: "/withdraw", icon: "IconArrowDownRight" },
    { label: "History", href: "/transactions", icon: "IconHistory" },
  ],
  stats: [
    { label: "Total Received", value: "$0.00" },
    { label: "Total Sent", value: "$0.00" },
    { label: "Available Balance", value: "$0.00" },
  ],
};

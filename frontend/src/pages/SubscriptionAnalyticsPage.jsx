import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, StatCard, Table, Button } from "../components";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

export const SubscriptionAnalyticsPage = () => {
  const [filterPeriod, setFilterPeriod] = useState("month");

  // Sample analytics data representing production tier structure
  const mrr = 1855000; // ₦1,855,000
  const arr = mrr * 12;
  const activeSubscribers = 530;
  const monthlySubscribers = 410;
  const yearlySubscribers = 120;
  const churnRate = "2.1%";

  const transactions = [
    {
      id: "txn_001",
      user: "Chidinma Nwosu",
      email: "chidinma@gmail.com",
      tier: "Monthly Plan",
      amount: "₦3,500",
      date: new Date(Date.now() - 1000 * 60 * 30).toLocaleString(),
      status: "SUCCESSFUL",
      reference: "ref_paystack_9812481",
    },
    {
      id: "txn_002",
      user: "Olumide Adebayo",
      email: "olumide@yahoo.com",
      tier: "Yearly Plan",
      amount: "₦35,000",
      date: new Date(Date.now() - 1000 * 60 * 180).toLocaleString(),
      status: "SUCCESSFUL",
      reference: "ref_paystack_9812410",
    },
    {
      id: "txn_003",
      user: "Ngozi Eze",
      email: "ngozi@hotmail.com",
      tier: "Monthly Plan",
      amount: "₦3,500",
      date: new Date(Date.now() - 1000 * 60 * 360).toLocaleString(),
      status: "SUCCESSFUL",
      reference: "ref_paystack_9812290",
    },
    {
      id: "txn_004",
      user: "Emmanuel Olatunji",
      email: "emmanuel@gmail.com",
      tier: "Monthly Plan",
      amount: "₦3,500",
      date: new Date(Date.now() - 1000 * 60 * 720).toLocaleString(),
      status: "SUCCESSFUL",
      reference: "ref_paystack_9811980",
    },
    {
      id: "txn_005",
      user: "Faith Kalu",
      email: "faith@gmail.com",
      tier: "Yearly Plan",
      amount: "₦35,000",
      date: new Date(Date.now() - 1000 * 60 * 1440).toLocaleString(),
      status: "SUCCESSFUL",
      reference: "ref_paystack_9810500",
    },
  ];

  const transactionColumns = [
    {
      key: "user",
      label: "Subscriber",
      render: (_, row) => (
        <div>
          <span className="font-semibold text-gray-900 block">{row.user}</span>
          <span className="text-xs text-gray-500">{row.email}</span>
        </div>
      ),
    },
    {
      key: "tier",
      label: "Plan Tier",
      render: (tier) => (
        <span
          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
            tier.includes("Yearly")
              ? "bg-purple-100 text-purple-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {tier}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (amount) => (
        <span className="font-semibold text-gray-900">{amount}</span>
      ),
    },
    {
      key: "status",
      label: "Payment Status",
      render: (status) => (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
          {status}
        </span>
      ),
    },
    {
      key: "reference",
      label: "Reference",
      render: (ref) => (
        <span className="text-xs font-mono text-gray-500">{ref}</span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (d) => <span className="text-xs text-gray-600">{d}</span>,
    },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Subscription & Revenue Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Financial metrics, active plans, and billing transaction log (§11.B #10)
          </p>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Monthly Recurring Revenue"
          value={`₦${mrr.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          label="Annual Recurring Revenue"
          value={`₦${arr.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          label="Active Subscribers"
          value={activeSubscribers}
          icon={<Users className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          label="Monthly Churn Rate"
          value={churnRate}
          icon={<CreditCard className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* Plan Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Monthly Subscription Plan">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div>
              <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">
                Standard Monthly Tier
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-1">₦3,500 / month</p>
              <p className="text-xs text-gray-500 mt-1">
                Full vetting access, unlimited match requests, 3 active slots
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-blue-700">
                {monthlySubscribers}
              </span>
              <p className="text-xs text-gray-600 font-medium">Subscribers</p>
            </div>
          </div>
        </Card>

        <Card title="Yearly Subscription Plan">
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div>
              <span className="text-xs font-bold uppercase text-purple-600 tracking-wider">
                Annual Premium Tier
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-1">₦35,000 / year</p>
              <p className="text-xs text-gray-500 mt-1">
                Includes 2 months free discount + pastoral consultation priority
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-purple-700">
                {yearlySubscribers}
              </span>
              <p className="text-xs text-gray-600 font-medium">Subscribers</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction Log Table */}
      <Card
        title="Recent Billing Transactions"
        subtitle="Live payment gateway transaction records"
      >
        <Table columns={transactionColumns} data={transactions} />
      </Card>
    </div>
  );
};

export default SubscriptionAnalyticsPage;
